from django.urls import path
from .views import (
    create_wallet,
    get_wallets,
    check_blockchain_connection,
    check_balance,
    send_transaction,
    login,
    logout,
    refresh_token,
    get_private_key,
)

urlpatterns = [
    path("create_wallet/", create_wallet, name="create_wallet"),
    path("wallets/", get_wallets, name="get_wallets"),
    path("check_blockchain/", check_blockchain_connection, name="check_blockchain"),
    path("check_balance/<str:address>/", check_balance, name="check_balance"),
    path("get_private_key/<str:address>/", get_private_key, name="get_private_key"),
    path("send_transaction/", send_transaction, name="send_transaction"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("refresh_token/", refresh_token, name="refresh_token"),
]