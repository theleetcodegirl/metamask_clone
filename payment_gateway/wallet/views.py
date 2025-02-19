from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Wallet
from .utils import (
    generate_wallet, 
    generate_jwt, 
    decrypt_private_key, 
    generate_refresh_token, 
    verify_refresh_token,
    get_balance,
    send_payment,
)
import json

@csrf_exempt
def create_wallet(request):
    """Create a new non-custodial wallet with password protection"""
    if request.method == "POST":
        data = json.loads(request.body)
        password = data.get("password")

        if not password:
            return JsonResponse({"error": "Password is required"}, status=400)

        wallet_data = generate_wallet(password)
        
        Wallet.objects.create(
            address=wallet_data["address"],
            encrypted_private_key=wallet_data["encrypted_private_key"],
            seed_phrase=wallet_data["seed_phrase"]
        )

        return JsonResponse({
            "address": wallet_data["address"],
            "seed_phrase": wallet_data["seed_phrase"]
        })

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def login(request):
    """Authenticate user using wallet address and password"""
    if request.method == "POST":
        data = json.loads(request.body)
        address = data.get("address")
        password = data.get("password")

        try:
            wallet = Wallet.objects.get(address=address)
            private_key = decrypt_private_key(wallet.encrypted_private_key, password)
            
            if not private_key:
                return JsonResponse({"error": "Invalid credentials"}, status=400)

            access_token = generate_jwt(wallet.address)
            refresh_token = generate_refresh_token(wallet.address)

            return JsonResponse({"access_token": access_token, "refresh_token": refresh_token})

        except Wallet.DoesNotExist:
            return JsonResponse({"error": "Wallet not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def refresh_token(request):
    """Generate a new JWT access token using a valid refresh token"""
    if request.method == "POST":
        data = json.loads(request.body)
        refresh_token = data.get("refresh_token")

        if not refresh_token:
            return JsonResponse({"error": "Refresh token is required"}, status=400)

        new_access_token = verify_refresh_token(refresh_token)

        if new_access_token:
            return JsonResponse({"access_token": new_access_token})
        else:
            return JsonResponse({"error": "Invalid refresh token"}, status=401)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def logout(request):
    """Handle logout (if using a token blacklist, store the token)"""
    if request.method == "POST":
        return JsonResponse({"message": "Logged out successfully"})
    
    return JsonResponse({"error": "Invalid request method"}, status=405)


@api_view(["GET"])
# @permission_classes([IsAuthenticated])
def get_wallets(request):
    """List all wallets (for demo purposes, requires authentication)"""
    wallets = Wallet.objects.values("address", "created_at", "seed_phrase", "encrypted_private_key")
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