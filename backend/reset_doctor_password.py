from django.contrib.auth.models import User

# Reset password for drmammootty
try:
    user = User.objects.get(username='drmammootty')
    user.set_password('100')
    user.save()
    print(f'✅ Password reset successfully for user: {user.username}')
    print(f'   Username: drmammootty')
    print(f'   New Password: 100')
except User.DoesNotExist:
    print('❌ User "drmammootty" does not exist')
    print('   Available users:')
    for u in User.objects.all():
        print(f'   - {u.username}')
