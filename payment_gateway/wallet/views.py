from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Wallet
from .utils import generate_wallet
from django.http import JsonResponse
from .utils import w3  # Import Web3 instance
from django.views.decorators.csrf import csrf_exempt
from .utils import get_balance

@api_view(["POST"])
def create_wallet(request):
    """Create a new wallet and store its details"""
    wallet = generate_wallet()
    
    # Store wallet details in the database
    Wallet.objects.create(
        address=wallet["address"],
        private_key=wallet["private_key"],
        seed_phrase=wallet["seed_phrase"]
    )
    
    return Response({
        "address": wallet["address"],
        "private_key": wallet["private_key"],
        "seed_phrase": wallet["seed_phrase"]
    })


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

def check_balance(request, address):
    """API to check wallet balance"""
    try:
        balance = get_balance(address)
        return JsonResponse(balance)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@csrf_exempt  # Allow POST requests from frontend
def send_transaction(request):
    """API to send ETH"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            from_address = data.get("from_address")
            private_key = data.get("private_key")
            to_address = data.get("to_address")
            amount_eth = float(data.get("amount"))

            if not all([from_address, private_key, to_address, amount_eth]):
                return JsonResponse({"error": "Missing required fields"}, status=400)

            tx_result = send_payment(from_address, private_key, to_address, amount_eth)
            return JsonResponse(tx_result)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)