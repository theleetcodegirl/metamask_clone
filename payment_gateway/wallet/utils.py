from web3 import Web3
from eth_account import Account
import secrets
from mnemonic import Mnemonic

# Use Alchemy Sepolia RPC URL
ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/MWrvA5sjSewezd3GCa6W8eagPJz5TVEA"
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))


# def generate_wallet():
#     """Generates an Ethereum wallet"""
#     account = w3.eth.account.create(secrets.token_hex(32))
#     return {
#         "address": account.address,
#         "private_key": account._private_key.hex()
#     }

def generate_wallet():
    """Generates an Ethereum wallet with a BIP39 seed phrase"""
    mnemo = Mnemonic("english")  # Use English word list
    seed_phrase = mnemo.generate(strength=128)  # 12-word mnemonic phrase

    # Derive a private key from the mnemonic
    seed = mnemo.to_seed(seed_phrase)
    account = Account.from_key(seed[:32])  # Get first 32 bytes of seed

    return {
        "address": account.address,
        "private_key": account.key.hex(),
        "seed_phrase": seed_phrase  # Add the BIP39 seed phrase
    }

def get_balance(address):
    """Gets the ETH balance of a wallet"""
    balance_wei = w3.eth.get_balance(address)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    return {"address": address, "balance": balance_eth}


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
        return {"error": str(e)}