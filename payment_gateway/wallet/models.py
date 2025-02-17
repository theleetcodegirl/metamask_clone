from django.db import models

class Wallet(models.Model):
    address = models.CharField(max_length=42, unique=True)
    private_key = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.address
