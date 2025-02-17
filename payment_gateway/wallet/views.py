from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Wallet
from .utils import generate_wallet
from django.http import JsonResponse
from .utils import w3  # Import Web3 instance

@api_view(["POST"])
def create_wallet(request):
    """Create a new wallet"""
    wallet = generate_wallet()
    Wallet.objects.create(address=wallet["address"], private_key=wallet["private_key"])
    return Response({"address": wallet["address"], "private_key": wallet["private_key"]})

@api_view(["GET"])
def get_wallets(request):
    """List all wallets (for demo purposes)"""
    wallets = Wallet.objects.values("address", "created_at")
    return Response(list(wallets))


def check_blockchain_connection(request):
    """API to check if the backend is connected to the Ethereum blockchain"""
    try:
        is_connected = w3.is_connected()
        latest_block = w3.eth.block_number if is_connected else None
        return JsonResponse({
            "connected": is_connected,
            "latest_block": latest_block
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
