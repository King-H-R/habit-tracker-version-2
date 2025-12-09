from app import app, db
import json

with app.app_context():
    client = app.test_client()
    print("Running internal API tests using Flask test_client")

    # Ensure DB tables exist
    db.create_all()

    # 1. GET /api/habits (initial)
    r = client.get('/api/habits')
    print('GET /api/habits ->', r.status_code, r.get_json())

    # 2. POST /api/habits
    habit_data = {
        "name": "Internal Test Habit",
        "description": "Testing via test_client",
        "category": "Testing",
        "frequency": "daily",
        "target_count": 1
    }
    r = client.post('/api/habits', json=habit_data)
    print('POST /api/habits ->', r.status_code, r.get_json())
    habit = r.get_json()
    hid = habit['id']

    # 3. GET /api/habits
    r = client.get('/api/habits')
    print('GET /api/habits ->', r.status_code, r.get_json())

    # 4. Complete habit
    r = client.post(f'/api/habits/{hid}/complete', json={"notes": "done"})
    print('POST complete ->', r.status_code, r.get_json())

    # 5. Get logs
    r = client.get(f'/api/habits/{hid}/logs')
    print('GET logs ->', r.status_code, r.get_json())

    # 6. Stats
    r = client.get('/api/stats')
    print('GET stats ->', r.status_code, r.get_json())

    # 7. Update habit
    update = {"name": "Updated Test", "frequency": "daily", "target_count": 2}
    r = client.put(f'/api/habits/{hid}', json=update)
    print('PUT habit ->', r.status_code, r.get_json())

    # 8. Delete habit
    r = client.delete(f'/api/habits/{hid}')
    print('DELETE habit ->', r.status_code, r.get_json())

    print('Internal tests completed')
