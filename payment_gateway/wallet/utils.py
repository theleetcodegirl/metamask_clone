from web3 import Web3
import secrets

w3 = Web3()

def generate_wallet():
    """Generates an Ethereum wallet"""
    account = w3.eth.account.create(secrets.token_hex(32))
    return {
        "address": account.address,
        "private_key": account._private_key.hex()
    }