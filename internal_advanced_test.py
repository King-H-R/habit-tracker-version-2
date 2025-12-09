from app_advanced import app, db
import json, uuid

with app.app_context():
    client = app.test_client()
    print("Running internal advanced API tests using Flask test_client")

    # Ensure DB tables exist
    db.create_all()

    # Create unique user
    uname = f"test_{uuid.uuid4().hex[:8]}"
    email = f"{uname}@example.com"
    pwd = "password123"

    # 1. Register
    r = client.post('/api/auth/register', json={
        'username': uname,
        'email': email,
        'password': pwd
    })
    print('REGISTER ->', r.status_code, r.get_json())

    if r.status_code not in (200,201):
        print('Registration may have failed; attempting login if user exists')

    token = None
    try:
        token = r.get_json().get('token')
    except Exception:
        token = None

    # 2. Login (in case register returned existing)
    if not token:
        r = client.post('/api/auth/login', json={'email': email, 'password': pwd})
        print('LOGIN ->', r.status_code, r.get_json())
        token = r.get_json().get('token')

    headers = {'Authorization': token} if token else {}

    # 3. Create a habit
    habit_data = {
        'name': 'Advanced Test Habit',
        'description': 'Created by internal_advanced_test',
        'frequency': 'daily',
        'repeat_days': [],
        'habit_type': 'yes_no',
        'target_value': 1.0
    }

    r = client.post('/api/habits', json=habit_data, headers=headers)
    print('CREATE HABIT ->', r.status_code, r.get_json())
    habit_id = None
    if r.status_code in (200,201):
        habit_id = r.get_json().get('habit_id') or r.get_json().get('id')

    # 4. Complete the habit
    if habit_id:
        r = client.post(f'/api/habits/{habit_id}/complete', json={'status': 'completed', 'notes': 'done'}, headers=headers)
        print('COMPLETE HABIT ->', r.status_code, r.get_json())

    # 5. Get analytics dashboard
    r = client.get('/api/analytics/dashboard', headers=headers)
    print('ANALYTICS ->', r.status_code, json.dumps(r.get_json(), indent=2) if r.status_code==200 else r.get_json())

    # 6. Get user profile
    r = client.get('/api/user/profile', headers=headers)
    print('PROFILE ->', r.status_code, json.dumps(r.get_json(), indent=2) if r.status_code==200 else r.get_json())

    # 7. Get habits
    r = client.get('/api/habits', headers=headers)
    print('GET HABITS ->', r.status_code, json.dumps(r.get_json(), indent=2) if r.status_code==200 else r.get_json())

    print('Internal advanced tests completed')
