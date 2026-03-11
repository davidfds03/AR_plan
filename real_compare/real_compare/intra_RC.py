import json
import math
import re

# ---------- Load Data ----------
with open("intents.json", encoding="utf-8") as f:
    INTENTS = json.load(f)

with open("planpro_data_2.json", encoding="utf-8") as f:
    PLANPRO = json.load(f)

# ---------- Helpers ----------
def normalize(text):
    return re.sub(r"[^a-z0-9\s]", "", text.lower())

def parse_price(p):
    try:
        return float(p)
    except:
        return 0.0

def parse_rating(r):
    try:
        return float(r)
    except:
        return 0.0


# ---------- Catalogue Index Map ----------
def build_catalogue_index(catalogue):
    index = {}
    for p in catalogue:
        pid = p.get("ID") or p.get("id")
        if pid:
            index[str(pid).lower()] = p
    return index


# ---------- Wishlist Builder ----------
def build_wishlist_from_indexes(catalogue, wishlist_indexes):
    index_map = build_catalogue_index(catalogue)
    wishlist = []

    for idx in wishlist_indexes:
        key = idx.strip().lower()
        if key in index_map:
            wishlist.append(index_map[key])
        else:
            print(f"⚠️ Invalid index ignored: {idx}")

    return wishlist


# ---------- Intent Extraction ----------
def extract_intent(user_text):
    text = normalize(user_text)

    intent = {
        "action": None,
        "product_type": None,
        "constraints": {},
        "material": [],
        "style": [],
        "usage": [],
        "signals": []
    }

    # ---- ACTION ----
    for k, phrases in INTENTS["action"].items():
        if any(p in text for p in phrases):
            intent["action"] = k

    # default fallback action
    if not intent["action"]:
        intent["action"] = "recommend"

    # ---- PRODUCT TYPE (HIERARCHY BASED) ----
    hierarchy = INTENTS.get("product_hierarchy", {})

    detected_type = None
    detected_subtype = None

    for main_type, data in hierarchy.items():

        # Check subtype first (stronger match)
        for subtype, keywords in data.get("subtypes", {}).items():
            if any(kw in text for kw in keywords):
                detected_type = main_type
                detected_subtype = subtype
                break

        # If subtype matched, stop
        if detected_subtype:
            break

        # Otherwise check main type keywords
        if any(kw in text for kw in data.get("keywords", [])):
            detected_type = main_type

    # Combine into readable label
    if detected_type and detected_subtype:
        intent["product_type"] = f"{detected_subtype} {detected_type}"
    elif detected_type:
        intent["product_type"] = detected_type

    # ---- CONSTRAINTS ----
    for cat, values in INTENTS["constraints"].items():
        for k, phrases in values.items():
            if any(p in text for p in phrases):
                intent["constraints"][cat] = k

    # ---- OTHER GROUPS ----
    for group in ["material", "style", "usage"]:
        for k, phrases in INTENTS[group].items():
            if any(p in text for p in phrases):
                intent[group].append(k)

    for k, phrases in INTENTS["decision_signals"].items():
        if any(p in text for p in phrases):
            intent["signals"].append(k)

    return intent


# ---------- DISPLAY CLEAN INTENT ----------
def format_intent_for_display(intent):
    formatted = intent.copy()

    for key in ["material", "style", "usage", "signals"]:
        if not formatted[key]:
            formatted[key] = "NA"

    if not formatted["product_type"]:
        formatted["product_type"] = "NA"

    if not formatted["constraints"]:
        formatted["constraints"] = "NA"

    return formatted


# ---------- FILTER + BASE SCORING ----------
def recommend(wishlist, intent):
    filtered = []

    for p in wishlist:
        score = 0

        subtype = normalize((p.get("SubType") or "").replace("_", " "))
        product_type = normalize(p.get("Type") or "")
        name = normalize(p.get("Name") or "")
        description = normalize(p.get("Description") or "")

        match = True

        # -------- PRODUCT TYPE MATCHING (FIXED LOGIC) --------
        if intent["product_type"]:

            query = normalize(intent["product_type"])
            parts = query.split()

            # If user said "gaming chair"
            if len(parts) >= 2:
                query_subtype = parts[0]
                query_type = parts[1]

                if query_subtype not in subtype:
                    match = False
                if query_type not in product_type:
                    match = False

                if match:
                    score += 4

            # If only main type detected (like just "chair")
            else:
                if parts[0] not in product_type:
                    match = False
                else:
                    score += 3

        # -------- MATERIAL --------
        if intent["material"]:
            material = normalize(p.get("Material") or "")
            if material not in intent["material"]:
                match = False
            else:
                score += 1

        # -------- STYLE --------
        if intent["style"]:
            style = normalize(p.get("Style") or "")
            if style not in intent["style"]:
                match = False
            else:
                score += 1

        # -------- CONSTRAINT BONUS (DO NOT FILTER) --------
        if intent["constraints"]:
            score += 1

        if match:
            filtered.append((p, score))

    return filtered

# ---------- FINAL COMPARISON (PRICE + RATING) ----------
def compare(recommended):
    results = []

    MAX_PRICE = 200000.0
    MAX_RATING = 5.0

    for p, base_score in recommended:
        price = parse_price(p.get("Price"))
        rating = parse_rating(p.get("Rating"))

        # Lower price = higher score
        price_score = math.log(MAX_PRICE / price + 1) if price > 0 else 0

        # Higher rating = higher score
        rating_score = (rating / MAX_RATING) * 2 if rating > 0 else 0

        final_score = (
            base_score * 3
            + price_score * 1.5
            + rating_score * 2
        )

        results.append({
            "id": p.get("ID"),
            "name": p.get("Name"),
            "price": price,
            "rating": rating,
            "final_score": round(final_score, 3)
        })

    return sorted(results, key=lambda x: x["final_score"], reverse=True)


# ---------- PIPELINE ----------
def intra_recommend_compare(user_text, wishlist):
    intent = extract_intent(user_text)
    recommended = recommend(wishlist, intent)

    if not recommended:
        return {
            "intent": intent,
            "results": []
        }

    compared = compare(recommended)

    return {
        "intent": intent,
        "results": compared
    }


# ---------- CLI RUNNER ----------
if __name__ == "__main__":

    print("\n🤖 AssistoBot – Intra Recommender & Comparer\n")

    # ---- STEP 1: WISHLIST INPUT ----
    raw_indexes = input(
        "Enter product indexes for your wishlist (comma separated)\n"
        "Example: x1,x4,x9\n> "
    ).strip()

    if not raw_indexes:
        print("❌ No wishlist provided.")
        exit()

    wishlist_indexes = raw_indexes.split(",")
    wishlist = build_wishlist_from_indexes(PLANPRO, wishlist_indexes)

    if not wishlist:
        print("❌ Wishlist is empty after validation.")
        exit()

    print(f"\n✅ Wishlist created with {len(wishlist)} items.\n")

    # ---- STEP 2: USER QUERY ----
    user_text = input("What are you looking for?\n> ").strip()

    if not user_text:
        print("❌ No input provided.")
        exit()

    output = intra_recommend_compare(user_text, wishlist)

    print("\n🧠 Detected Intent:")
    print(json.dumps(format_intent_for_display(output["intent"]), indent=2))

    if not output["results"]:
        print("\n❌ No matching products found in your wishlist.")
        exit()

    print("\n🏆 Ranked Products:\n")

    for idx, r in enumerate(output["results"], start=1):
        rating_str = f"⭐ {r['rating']}" if r["rating"] else "⭐ N/A"
        print(
            f"{idx}. {r['name']} | ₹{r['price']} | {rating_str} | score={r['final_score']}"
        )