from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Wallet
from .utils import generate_wallet

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