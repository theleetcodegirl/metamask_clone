from web3 import Web3
import secrets

# Use Alchemy Sepolia RPC URL
ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/MWrvA5sjSewezd3GCa6W8eagPJz5TVEA"
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))


def generate_wallet():
    """Generates an Ethereum wallet"""
    account = w3.eth.account.create(secrets.token_hex(32))
    return {
        "address": account.address,
        "private_key": account._private_key.hex()
    }