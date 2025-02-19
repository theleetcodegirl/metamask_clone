import json
import secrets
import jwt
import datetime
from web3 import Web3
from eth_account import Account
from mnemonic import Mnemonic
from cryptography.fernet import Fernet
from django.conf import settings
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from base64 import urlsafe_b64encode
import logging
from eth_utils import to_checksum_address  # Add this import
from .models import Wallet

logger = logging.getLogger(__name__)

# Use Alchemy Sepolia RPC URL
ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/MWrvA5sjSewezd3GCa6W8eagPJz5TVEA"
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

# Secret key for JWT
JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_MINUTES = 15
REFRESH_TOKEN_EXPIRY_DAYS = 7

def derive_key(password):
    """Derive a key from the password using PBKDF2."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'some_salt',  # Use a proper salt in production
        iterations=100000,
        backend=default_backend()
    )
    return urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_private_key(private_key, password):
    """Encrypt private key using a password."""
    try:
        key = derive_key(password)
        cipher = Fernet(key)
        encrypted_private_key = cipher.encrypt(private_key.encode()).decode()
        return encrypted_private_key
    except Exception as e:
        return {"error": f"Error encrypting private key: {str(e)}"}

def decrypt_private_key(encrypted_private_key, password):
    """Decrypt private key using the password."""
    try:
        key = derive_key(password)
        cipher = Fernet(key)
        decrypted_private_key = cipher.decrypt(encrypted_private_key.encode()).decode()
        return decrypted_private_key
    except Exception as e:
        return {"error": f"Error decrypting private key: {str(e)}"}

def generate_wallet(password):
    """Generates a wallet and encrypts private key"""
    try:
        mnemo = Mnemonic("english")
        seed_phrase = mnemo.generate(strength=128)
        seed = mnemo.to_seed(seed_phrase)
        account = Account.from_key(seed[:32])

        encrypted_private_key = encrypt_private_key(account.key.hex(), password)

        return {
            "address": account.address,
            "seed_phrase": seed_phrase,
            "encrypted_private_key": encrypted_private_key,
        }
    except Exception as e:
        return {"error": f"Error generating wallet: {str(e)}"}
    
    
def generate_jwt(address):
    """Generate JWT token for authentication"""
    try:
        payload = {
            "address": address,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRY_MINUTES)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    except Exception as e:
        return {"error": f"Error generating JWT: {str(e)}"}

def generate_refresh_token(address):
    """Generate a refresh token for the user."""
    try:
        payload = {
            "address": address,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS),
            "iat": datetime.datetime.utcnow()
        }
        refresh_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return refresh_token
    except Exception as e:
        return {"error": f"Error generating refresh token: {str(e)}"}

def verify_jwt(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["address"]
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}
    except Exception as e:
        return {"error": f"Error verifying JWT: {str(e)}"}

def verify_refresh_token(refresh_token):
    """Verify refresh token and generate a new access token if valid."""
    try:
        decoded_payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        new_access_token = generate_jwt(decoded_payload["address"])
        return new_access_token
    except jwt.ExpiredSignatureError:
        return {"error": "Refresh token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid refresh token"}
    except Exception as e:
        return {"error": f"Error verifying refresh token: {str(e)}"}

def get_balance(address):
    """Gets the ETH balance of a wallet"""
    try:
        balance_wei = w3.eth.get_balance(address)
        balance_eth = w3.from_wei(balance_wei, 'ether')
        return {"address": address, "balance": balance_eth}
    except Exception as e:
        return {"error": f"Error getting balance: {str(e)}"}



def send_payment(from_address, to_address, amount_eth, password):
    """Sends ETH from one wallet to another using the user's wallet credentials"""
    try:
        # Get wallet and decrypt private key
        user_wallet = Wallet.objects.get(address=from_address)
        private_key = decrypt_private_key(user_wallet.encrypted_private_key, password)
        
        if isinstance(private_key, dict) and "error" in private_key:
            return private_key

        # Convert addresses
        from_address = to_checksum_address(from_address)
        to_address = to_checksum_address(to_address)
        
        # Convert amount to Wei
        amount_wei = w3.to_wei(amount_eth, 'ether')
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(from_address, 'pending')
        
        # Use lower gas settings
        gas_price = w3.eth.gas_price
        gas_limit = 21000  # Standard ETH transfer
        
        # Calculate total cost
        total_cost = amount_wei + (gas_limit * gas_price)
        
        # Check balance
        balance_wei = w3.eth.get_balance(from_address)
        if balance_wei < total_cost:
            return {
                "error": f"Insufficient funds. Need {w3.from_wei(total_cost, 'ether')} ETH, have {w3.from_wei(balance_wei, 'ether')} ETH"
            }

        # Create transaction
        tx = {
            "nonce": nonce,
            "to": to_address,
            "value": amount_wei,
            "gas": gas_limit,
            "gasPrice": gas_price,
            "chainId": 11155111  # Sepolia chain ID
        }

        # Sign and send
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=500)
        
        return {
            "tx_hash": w3.to_hex(tx_hash),
            "status": "confirmed" if receipt.status == 1 else "failed",
            "block_number": receipt.blockNumber,
            "gas_used": receipt.gasUsed
        }

    except Exception as e:
        logger.error(f"Error sending payment: {str(e)}", exc_info=True)
        return {"error": f"Error sending payment: {str(e)}"}