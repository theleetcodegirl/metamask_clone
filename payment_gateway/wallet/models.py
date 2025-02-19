from django.db import models

class Wallet(models.Model):
    address = models.CharField(max_length=42, unique=True)
    encrypted_private_key = models.TextField()
    seed_phrase = models.TextField()  # Store the BIP39 seed phrase
    password = models.CharField(max_length=128)  # Add this line
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.address