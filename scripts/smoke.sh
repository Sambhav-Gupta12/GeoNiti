#!/usr/bin/env bash
set -e

echo "========================================="
echo "  BhuNiti API Smoke Test (Local)"
echo "========================================="

BASE_URL="http://localhost:3000/api/v1"

login_as() {
  local email=$1
  local pass=$2
  local res=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$email\",\"password\":\"$pass\"}")
  echo "$res" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
}

echo "[1/4] Public endpoints..."
curl -s -f "$BASE_URL/public/overview" > /dev/null && echo "✅ /public/overview OK" || echo "❌ /public/overview FAILED"
curl -s -f "$BASE_URL/health" > /dev/null && echo "✅ /health OK" || echo "❌ /health FAILED"

echo ""
echo "[2/4] Testing Data Admin (admin@example.com)..."
TOKEN=$(login_as "admin@example.com" "password123")
if [ -z "$TOKEN" ]; then
  echo "❌ Login failed for Data Admin"
else
  echo "✅ Login OK"
  curl -s -f -H "Authorization: Bearer $TOKEN" "$BASE_URL/auth/me" > /dev/null && echo "✅ /auth/me OK" || echo "❌ /auth/me FAILED"
  
  # Admin Queue
  curl -s -f -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/queue" > /dev/null && echo "✅ /admin/queue OK" || echo "❌ /admin/queue FAILED"
  
  # Audit Log
  curl -s -f -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/audit" > /dev/null && echo "✅ /admin/audit OK" || echo "❌ /admin/audit FAILED"
  
  # System Health
  curl -s -f -H "Authorization: Bearer $TOKEN" "$BASE_URL/admin/system-health" > /dev/null && echo "✅ /admin/system-health OK" || echo "❌ /admin/system-health FAILED"
fi

echo ""
echo "[3/4] Testing Guest (guest@example.com)..."
GUEST_TOKEN=$(login_as "guest@example.com" "password123")
if [ -z "$GUEST_TOKEN" ]; then
  echo "❌ Login failed for Guest"
else
  echo "✅ Login OK"
  # Search (Should work)
  curl -s -f -H "Authorization: Bearer $GUEST_TOKEN" -X POST "$BASE_URL/search" -H "Content-Type: application/json" -d "{\"query\":\"test\"}" > /dev/null && echo "✅ /search OK" || echo "❌ /search FAILED"
  
  # Attempt Admin (Should fail with 403)
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $GUEST_TOKEN" "$BASE_URL/admin/queue")
  if [ "$STATUS" == "403" ]; then echo "✅ /admin/queue correctly rejected Guest (403)"; else echo "❌ /admin/queue did not reject Guest (got $STATUS)"; fi
fi

echo ""
echo "[4/4] Testing Policy Analyst (analyst@example.com)..."
ANALYST_TOKEN=$(login_as "analyst@example.com" "password123")
if [ -z "$ANALYST_TOKEN" ]; then
  echo "❌ Login failed for Analyst"
else
  echo "✅ Login OK"
  
  # Workspace Projects
  curl -s -f -H "Authorization: Bearer $ANALYST_TOKEN" "$BASE_URL/projects" > /dev/null && echo "✅ /projects OK" || echo "❌ /projects FAILED"
  
  # Scenarios
  curl -s -f -H "Authorization: Bearer $ANALYST_TOKEN" "$BASE_URL/scenarios/parameters" > /dev/null && echo "✅ /scenarios/parameters OK" || echo "❌ /scenarios/parameters FAILED"
  
  # Analytics
  curl -s -f -H "Authorization: Bearer $ANALYST_TOKEN" "$BASE_URL/analytics/trend?indicator=cropland_pct&regions=1" > /dev/null && echo "✅ /analytics/trend OK" || echo "❌ /analytics/trend FAILED"
  
  # Graph
  curl -s -f -H "Authorization: Bearer $ANALYST_TOKEN" "$BASE_URL/graph?center_type=document&center_id=123e4567-e89b-12d3-a456-426614174000" > /dev/null && echo "✅ /graph OK" || echo "❌ /graph FAILED"
  
  # Challenges
  curl -s -f "$BASE_URL/challenges" > /dev/null && echo "✅ /challenges OK" || echo "❌ /challenges FAILED"
fi

echo "========================================="
echo "  Smoke Test Complete"
echo "========================================="
