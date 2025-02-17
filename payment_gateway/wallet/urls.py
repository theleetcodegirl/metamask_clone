from django.urls import path
from .views import create_wallet, get_wallets, check_blockchain_connection

urlpatterns = [
    path("create_wallet/", create_wallet, name="create_wallet"),
    path("wallets/", get_wallets, name="get_wallets"),
    path("check_blockchain/", check_blockchain_connection, name="check_blockchain"),
]
