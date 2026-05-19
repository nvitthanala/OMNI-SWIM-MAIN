import json
from importlib import util
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
pc_path = REPO / 'backend' / 'point_calculator.py'

spec = util.spec_from_file_location('pc', str(pc_path))
pc = util.module_from_spec(spec)
spec.loader.exec_module(pc)

athletes = [
    {"name": "Alice", "event": "Event 1 Women 100 Free", "gender": "Women", "team": "UWF", "year": "SR", "is_relay": False, "prelims_time": None, "finals_time": "1:00.00", "round_swam": "A Final", "is_exhibition": False, "is_time_trial": False, "rank": "1", "points": 0, "conference": "NSISC"},
    {"name": "Beth", "event": "Event 1 Women 100 Free", "gender": "Women", "team": "Henderson", "year": "JR", "is_relay": False, "prelims_time": None, "finals_time": "1:01.00", "round_swam": "B Final", "is_exhibition": False, "is_time_trial": False, "rank": "9", "points": 0, "conference": "NSISC"},
    {"name": "Cara", "event": "Event 1 Women 100 Free", "gender": "Women", "team": "Other", "year": "FR", "is_relay": False, "prelims_time": None, "finals_time": "0:59.50", "round_swam": "C Final", "is_exhibition": False, "is_time_trial": False, "rank": "13", "points": 0},
    {"name": "Xena", "event": "Event 1 Women 100 Free", "gender": "Women", "team": "Guest", "year": "SR", "is_relay": False, "prelims_time": None, "finals_time": "0:58.00", "round_swam": "A Final", "is_exhibition": True, "is_time_trial": False, "rank": None, "points": 0},
]

res = pc.calculate_points(athletes)
print(json.dumps(res, indent=2))
