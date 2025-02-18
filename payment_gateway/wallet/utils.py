import json
import secrets
import jwt
import datetime
from web3 import Web3
from eth_account import Account
from mnemonic import Mnemonic
from cryptography.fernet import Fernet
from django.conf import settings

# Use Alchemy Sepolia RPC URL
ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/MWrvA5sjSewezd3GCa6W8eagPJz5TVEA"
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

# Secret key for JWT
JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_MINUTES = 15
REFRESH_TOKEN_EXPIRY_DAYS = 7

def encrypt_private_key(private_key, password):
    """Encrypt private key using a password."""
    try:
        key = Fernet.generate_key()
        cipher = Fernet(key)
        encrypted_private_key = cipher.encrypt(private_key.encode()).decode()
        return encrypted_private_key, key.decode()
    except Exception as e:
        return {"error": f"Error encrypting private key: {str(e)}"}

def decrypt_private_key(encrypted_private_key, key):
    """Decrypt private key using stored key."""
    try:
        cipher = Fernet(key.encode())
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

        encrypted_private_key, key = encrypt_private_key(account.key.hex(), password)

        return {
            "address": account.address,
            "seed_phrase": seed_phrase,
            "encrypted_private_key": encrypted_private_key,
            "key": key
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

def send_payment(from_address, private_key, to_address, amount_eth):
    """Sends ETH from one wallet to another"""
    try:
        amount_wei = w3.to_wei(amount_eth, 'ether')
        nonce = w3.eth.get_transaction_count(from_address)

        # Create transaction
        tx = {
            "nonce": nonce,
            "to": to_address,
            "value": amount_wei,
            "gas": 21000,
            "gasPrice": w3.to_wei('10', 'gwei')  # Adjust gas price as needed
        }

        # Sign the transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)

        # Send the transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return {"tx_hash": tx_hash.hex()}
    except Exception as e:
        return {"error": f"Error sending payment: {str(e)}"}