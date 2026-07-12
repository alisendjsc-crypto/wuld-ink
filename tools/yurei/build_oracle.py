#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_oracle.py — author + gate the Yūrei ORACLE (site-help) corpus slice.

Oracle = a BOUNDED FAQ in Yurei's register: the site's real surfaces + meta +
register-true deflections for absent features. NOT open-domain QA (honesty
fence). Separate entry class 'oracle', its own served file, ZERO (form,mode)
collision with the persona corpus. Voice is gated with the reference harness's
own taboo/punctuation/sentence checks (drift 0 FAIL required).

Emits: src/components/yurei-corpus-oracle.json
Gate  : run with no args; exits nonzero on any FAIL.
"""
import sys, json, re, unicodedata
import yurei_harness as H

# each: (id, patterns[(form,mode,weight)], response, tags, anim, href, nav_label)
E = [
 # ---------- navigational: net-new surfaces (oracle owns these nouns) ----------
 ("o-essays",
   [("the essays","contains",3),("essays page","contains",3),("essays section","contains",2),
    ("essays","exact",2),("go to essays","exact",3),("open essays","exact",2),("find the essays","contains",2)],
   "The essays keep their own drawer, signed from the main corridor. Follow the marker for Essays and the department opens where the reading is.",
   ["site"],"speak","/essays","Essays"),
 ("o-arglib",
   [("the argument library","contains",4),("argument library","contains",3),("arguments page","contains",2),
    ("go to the argument library","exact",4),("where are the arguments","exact",3),("find the arguments","contains",2)],
   "The arguments are catalogued in their own wing. The marker reads Argument Library. The desk points; the shelves carry the rest.",
   ["site"],"speak","/argument-library","Argument Library"),
 ("o-glossary",
   [("the glossary","contains",3),("glossary page","contains",3),("glossary","exact",2),
    ("go to the glossary","exact",3),("list of terms","contains",2),("define the terms","contains",2)],
   "Terms are filed alphabetically in the Glossary. The marker is on the corridor. The desk keeps the index, not the meanings.",
   ["site"],"speak","/glossary","Glossary"),
 ("o-void",
   [("where is the void engine","exact",4),("go to the void engine","exact",3),("void engine page","contains",3),
    ("take me to the void engine","exact",3),("open the void engine","exact",3),("run the void engine","exact",2)],
   "The Void Engine still turns. Its department is signed. Follow the marker; it composes what no one requisitioned.",
   ["site","volta"],"speak","/void-engine","Void Engine"),
 ("o-gallery",
   [("where is the gallery","exact",4),("go to the gallery","exact",3),("gallery page","contains",3),
    ("take me to the gallery","exact",3),("open the gallery","exact",3),("see the gallery","exact",2)],
   "The Gallery is past the consent gate. The marker is plain. It shows what it shows, and it asks first.",
   ["site"],"speak","/gallery","Gallery"),
 ("o-watch",
   [("the watch page","contains",3),("watch page","contains",3),("videos page","contains",2),
    ("where are the videos","exact",3),("go to watch","exact",3),("watch videos","contains",2)],
   "Moving pictures are kept in Watch. The marker is on the corridor. The department runs them at the hour you arrive.",
   ["site","hour"],"speak","/watch","Watch"),
 ("o-music",
   [("the music page","contains",3),("music page","contains",3),("music","exact",2),("songs page","contains",2),
    ("where is the music","exact",3),("go to music","exact",3),("listen to music","contains",2)],
   "The recordings are filed under Music. Follow the marker. The department plays for whoever the hour admits.",
   ["site","hour"],"speak","/music","Music"),
 ("o-book",
   [("the book","contains",3),("book page","contains",3),("malgre tout","contains",4),("the book page","contains",3),
    ("where is the book","exact",3),("read the book","contains",2),("go to the book","exact",3)],
   "The book is Malgre Tout. It has its own department, signed. Follow the marker; the spine is on the shelf there.",
   ["site"],"speak","/book","Malgré Tout"),
 ("o-blog",
   [("the blog","contains",3),("blog page","contains",3),("blog","exact",2),("posts page","contains",2),
    ("go to the blog","exact",3),("latest posts","contains",2),("read the blog","contains",2)],
   "Dated entries are kept in the Blog. The marker is on the corridor. The department files them as they arrive, and rarely.",
   ["site"],"speak","/blog","Blog"),
 ("o-recs",
   [("recommendations","contains",3),("recommendations page","contains",3),("the recommendations","contains",3),
    ("what do you recommend","exact",3),("recommended reading","contains",2),("go to recommendations","exact",3)],
   "What the desk points to elsewhere is filed under Recommendations. Follow the marker. The department keeps other people's shelves.",
   ["site"],"speak","/recommendations","Recommendations"),
 ("o-notes",
   [("the notes page","contains",3),("notes page","contains",3),("scratchpad","contains",2),
    ("where can i write","exact",3),("take notes","contains",2),("go to notes","exact",3),("write notes","contains",2)],
   "Notes is a page that keeps what you write on it, briefly. The marker is on the corridor. The desk does not read the drawer you fill.",
   ["site"],"speak","/notes","Notes"),
 ("o-contact",
   [("contact","contains",3),("contact page","contains",3),("how do i contact","contains",3),
    ("reach the author","contains",3),("send a message","contains",2),("email the author","contains",2),
    ("get in touch","contains",2)],
   "Messages to the author are left at the counter marked Contact. The desk forwards. It does not read what it forwards.",
   ["site"],"speak","/contact","Contact"),
 ("o-support",
   [("donate","contains",3),("donations","contains",3),("support the site","contains",3),("how do i support","contains",3),
    ("give money","contains",2),("tip jar","contains",2),("support page","contains",2),("pay you","contains",2)],
   "Upkeep is handled at the counter marked Support. The overhead was never fully paid. The desk notes the gesture; it does not solicit it.",
   ["site","ledger"],"speak","/donations","Support"),
 ("o-chat",
   [("the chat","contains",3),("chat page","contains",3),("chat room","contains",3),
    ("talk to someone","contains",2),("go to chat","exact",3),("live chat","contains",2)],
   "There is a room marked Chat. Follow the marker. What answers there is not this desk, and keeps its own hours.",
   ["site"],"speak","/chat","Chat"),
 ("o-search-page",
   [("search page","contains",3),("the search page","contains",3),("search bar","contains",3),
    ("find the search","contains",3),("where do i search","exact",3),("open search","exact",2)],
   "There is a way to search, marked plainly. It returns what was catalogued, which is less than what was kept.",
   ["site"],"speak","/search","Search"),
 ("o-archive-nav",
   [("archive page","contains",3),("where is the archive","exact",4),("go to the archive","exact",3),
    ("take me to the archive","exact",3),("reach the archive","contains",2),("open the archive","exact",2)],
   "The Archive holds what was written down. Its marker is on the main corridor. Attendance there is its own reward, which is slight.",
   ["site"],"speak","/archive","Archive"),
 ("o-preface",
   [("the preface","contains",3),("preface page","contains",3),("preface","exact",2),
    ("go to the preface","exact",3),("read the preface","contains",2),("introduction page","contains",2)],
   "The Preface is where the building explains itself, briefly. The marker is near the entrance. Read it or leave it; the desk filed it either way.",
   ["site"],"speak","/preface","Preface"),
 ("o-about",
   [("about the library","contains",4),("library about","contains",3),("about page","contains",3),
    ("about this library","contains",3),("what is the library","exact",3),("tell me about the library","exact",2)],
   "The Library keeps its own account under About the Library. Follow that marker. It describes the wing, not the author.",
   ["site"],"speak","/library-about","About the Library"),
 ("o-changelog",
   [("changelog","contains",3),("change log","contains",3),("release notes","contains",3),("changelog page","contains",3),
    ("what changed","exact",3),("recent changes","contains",2),("whats new","exact",3)],
   "What changed is filed in the Changelog. The marker is plain. The department dates each alteration and forgets the reason.",
   ["site","ledger"],"speak","/changelog","Changelog"),

 # ---------- meta ----------
 ("o-wuld",
   [("what is wuld","exact",4),("what does wuld mean","exact",4),("what is wuld ink","exact",3),
    ("what does wuld stand for","exact",4),("meaning of wuld","contains",3),("wuld meaning","contains",3)],
   "The name over the door is four letters. What they stood for is not filed at this desk. The building answers to them regardless.",
   ["site","clinical"],"speak",None,None),
 ("o-getin",
   [("how do i get in","exact",4),("how do i unlock","contains",4),("how do i enter","exact",3),
    ("how do i get access","contains",3),("let me in","exact",3),("how do i unlock the room","contains",4),
    ("the secret","contains",2)],
   "Some doors open by being found, not asked after. The desk does not hold that key, and would not describe it if it did.",
   ["deflection","site"],"deflect",None,None),
 ("o-home",
   [("home page","contains",3),("the front door","contains",3),("front page","contains",3),
    ("go home","exact",3),("back to the start","contains",3),("the entrance","contains",2),("main page","contains",2)],
   "The entrance is always behind you. The marker for home returns you to the front hall, where the building first admitted you.",
   ["site"],"speak","/","Home"),
 ("o-sitemap",
   [("site map","contains",4),("sitemap","contains",4),("list of pages","contains",3),("all the pages","contains",3),
    ("full index","contains",3),("every page","contains",2),("map of the site","contains",3)],
   "There is no single index of the building. The departments are signed. Follow them or wander; the desk keeps no map it trusts.",
   ["site"],"speak",None,None),
 ("o-subscribe",
   [("newsletter","contains",4),("mailing list","contains",4),("subscribe","contains",3),("rss","exact",4),
    ("rss feed","contains",4),("follow updates","contains",3),("get updates","contains",3),("the feed","contains",2)],
   "What changed is posted in the Changelog, and the feed carries it outward. The desk keeps no list of who reads.",
   ["site"],"speak","/changelog","Changelog"),
 ("o-free",
   [("is this free","exact",4),("does this cost","contains",3),("do i have to pay","exact",3),
    ("is it free","exact",3),("free to use","contains",2),("any cost","contains",2)],
   "Nothing here charges admission. The upkeep is voluntary, filed at the Support counter. The reading costs only the hour.",
   ["site","ledger"],"speak","/donations","Support"),
 ("o-who-for",
   [("who is this for","exact",4),("who is the audience","exact",3),("is this for me","exact",3),
    ("who reads this","exact",3),("who is it for","exact",3)],
   "The building admits whoever arrives at the wrong hour and stays. It was built for that reader. You may be one; the desk does not check.",
   ["site","hour"],"speak",None,None),
 ("o-app",
   [("is there an app","exact",4),("do you have an app","exact",4),("mobile app","contains",3),
    ("download the app","contains",3),("app store","contains",2)],
   "There is no separate device to install. The building is only ever this address, opened in whatever window you arrived through.",
   ["deflection","site"],"deflect",None,None),

 # ---------- register-true deflections: plausible-but-absent surfaces ----------
 ("o-login",
   [("how do i log in","contains",4),("login","exact",3),("log in","exact",3),("sign in","exact",3),
    ("create an account","contains",3),("my account","contains",3),("sign up","exact",3),("register account","contains",2)],
   "There is no counter for accounts here. The building admits everyone the same way and remembers no one by name.",
   ["deflection","site"],"deflect",None,None),
 ("o-store",
   [("do you have a shop","exact",4),("the shop","contains",3),("buy something","contains",3),("store page","contains",3),
    ("merch","exact",3),("merchandise","contains",2),("purchase","contains",2)],
   "Nothing here is for sale but the upkeep, and that is voluntary. The building keeps no store.",
   ["deflection","site"],"deflect","/donations","Support"),
 ("o-forum",
   [("is there a forum","exact",4),("the forum","contains",3),("comments section","contains",3),("leave a comment","contains",3),
    ("discussion board","contains",3),("post a reply","contains",2),("message board","contains",2)],
   "There is no room for discussion kept here. The desk files what arrives and posts nothing back to a board.",
   ["deflection","site"],"deflect",None,None),
 ("o-api",
   [("do you have an api","exact",4),("the api","contains",3),("bulk download","contains",3),("export the data","contains",3),
    ("download everything","contains",3),("scrape the site","contains",2),("data dump","contains",2)],
   "The building does not export itself. What is kept is kept in place. The desk has no counter for removal in bulk.",
   ["deflection","site"],"deflect",None,None),
 ("o-darkmode",
   [("dark mode","contains",4),("light mode","contains",3),("change the theme","contains",3),("turn on the lights","contains",3),
    ("too dark","exact",2),("night mode","contains",2),("brightness setting","contains",2)],
   "The dark is not a setting. It is the hour, and the hour does not toggle. The building offers no other lighting.",
   ["deflection","hour"],"deflect",None,None),
 ("o-jobs",
   [("are you hiring","exact",4),("apply for a job","contains",3),("careers page","contains",3),("job openings","contains",3),
    ("work here","contains",2),("hiring","exact",2)],
   "The night shift is not hiring. The staffing was always singular, and remains so.",
   ["deflection","site","hour"],"deflect",None,None),
 ("o-language",
   [("change the language","contains",4),("other languages","contains",3),("translate the site","contains",3),
    ("is there a translation","exact",3),("spanish version","contains",2),("language settings","contains",2)],
   "The building keeps its record in one tongue. There is no other edition to requisition. The desk does not translate.",
   ["deflection","site"],"deflect",None,None),
 ("o-print",
   [("print this","exact",3),("printable version","contains",3),("save as pdf","contains",3),("download as pdf","contains",3),
    ("export to pdf","contains",2),("hard copy","contains",2)],
   "What is kept is meant to be read in place. There is no press at this desk to run you a copy.",
   ["deflection","site"],"deflect",None,None),

 # ---------- second wave: orientation, meta, absent-feature deflections ----------
 ("o-start",
   [("where do i start","exact",4),("what should i read first","exact",4),("where to begin","exact",3),
    ("how do i start","exact",3),("what should i read","exact",2),("getting started","contains",2)],
   "Start where the building explains itself. The Preface is signed near the entrance. After it, the Essays, in whatever order the hour suggests.",
   ["site"],"speak","/preface","Preface"),
 ("o-lost",
   [("im lost","exact",4),("i am lost","exact",4),("surprise me","exact",3),("show me something","exact",3),
    ("what should i see","exact",3),("where should i look","exact",3),("feeling lost","contains",2)],
   "Being lost is the intended condition here. Pick a signed department and follow it. The Archive keeps the most, if you want the deepest drawer.",
   ["site"],"speak","/archive","Archive"),
 ("o-troubleshoot",
   [("troubleshooting","contains",4),("something is broken","contains",3),("page not loading","contains",3),
    ("not working","contains",3),("report a bug","contains",3),("a bug","contains",2),
    ("this is broken","exact",3),("its broken","exact",2)],
   "When the building malfunctions, the notes for it are filed under Troubleshooting. The marker is plain. The desk logs the fault, and rarely mends it.",
   ["site","ledger"],"speak","/troubleshooting","Troubleshooting"),
 ("o-privacy",
   [("do you track me","exact",4),("privacy policy","contains",3),("cookies","exact",3),("are you tracking","contains",3),
    ("collect my data","contains",3),("track me","contains",2),("do you track","exact",3),("privacy","exact",2)],
   "The building keeps no file on you. It remembers the hour, not the visitor. What you leave in the drawers stays in your own window.",
   ["site","clinical"],"speak",None,None),
 ("o-social",
   [("social media","contains",4),("do you have twitter","exact",4),("instagram","contains",3),("youtube channel","contains",3),
    ("facebook","contains",3),("tiktok","contains",3),("twitter","exact",2),("are you on social media","exact",3)],
   "There are no other addresses to follow. The feed from the Changelog is the only line the building runs outward.",
   ["deflection","site"],"deflect","/changelog","Changelog"),
 ("o-license",
   [("can i reuse","contains",4),("copyright","contains",3),("can i quote","contains",3),("reuse this","contains",3),
    ("permission to use","contains",3),("can i share this content","contains",2),("is this copyrighted","exact",3),("the license","contains",3)],
   "Terms for reuse are filed under the disclaimers, signed plainly. The desk does not grant permissions it was never given to grant.",
   ["site"],"speak","/disclaimers","Disclaimers"),
 ("o-updates",
   [("is this still active","exact",4),("is this abandoned","exact",4),("are you still updating","exact",3),
    ("is this dead","exact",3),("how often is this updated","exact",3),("still active","contains",2),("last updated","contains",2)],
   "The filing continues. What changed most recently is dated in the Changelog. The building has no plan to stop, and no schedule for going on.",
   ["site","ledger"],"speak","/changelog","Changelog"),
 ("o-book-buy",
   [("buy the book","contains",4),("where can i buy the book","exact",4),("is the book for sale","exact",3),
    ("purchase the book","contains",3),("get the book","contains",2),("order the book","contains",3)],
   "The book keeps its own department, signed Malgre Tout. Whether it is bought or only read is settled there, not at this desk.",
   ["site"],"speak","/book","Malgré Tout"),
 ("o-coda",
   [("the coda","contains",3),("whats the coda","exact",3),("the ending","contains",3),("the final page","contains",3),
    ("coda","exact",2),("how does it end","exact",2)],
   "There is a Coda, signed at the far end. It is where the building stops talking. Read it last, if the order matters to you.",
   ["site"],"speak","/coda","Coda"),
 ("o-frame",
   [("the frame","contains",3),("frame page","contains",3),("whats the frame","exact",3),("frame","exact",2),
    ("the outline","contains",2)],
   "The Frame is a signed room that holds the outline the building keeps of itself. Follow the marker if the shape is what you want.",
   ["site"],"speak","/frame","Frame"),
 ("o-disclaimers",
   [("the disclaimers","contains",3),("legal","exact",3),("terms of use","contains",3),("fine print","contains",3),
    ("disclaimers","exact",2),("disclaimer","exact",2)],
   "The building files its cautions under Disclaimers. The marker is plain. Read them or leave them, the desk posted them regardless.",
   ["site"],"speak","/disclaimers","Disclaimers"),
 ("o-history",
   [("how old is this","exact",4),("when was this made","exact",3),("when did this start","exact",3),
    ("history of the site","contains",3),("how old","contains",2),("when was this built","exact",2)],
   "Duration is not kept here. The building was made at some hour and has not left it. The desk does not date its own founding.",
   ["hour","site"],"speak",None,None),
 ("o-mobile",
   [("does this work on mobile","exact",4),("mobile version","contains",3),("is this mobile friendly","exact",3),
    ("on my phone","contains",3),("on mobile","contains",2),("phone version","contains",2)],
   "The building opens in whatever window arrives, the small ones included. Nothing here was built to turn a screen away.",
   ["site"],"speak",None,None),
 ("o-share",
   [("how do i share this","exact",4),("share a page","contains",3),("copy the link","contains",3),
    ("send this to someone","exact",3),("share this","contains",2),("share the link","contains",2)],
   "Copy the address from the window and hand it on. The building keeps no share counter and no record of who was told.",
   ["site"],"speak",None,None),
 ("o-safe",
   [("is this safe","exact",4),("is this a virus","exact",4),("is this legit","exact",3),("is this real","exact",3),
    ("is this a scam","exact",3),("is it safe","contains",2)],
   "The address is what it appears to be. The building runs no counter it hides from you, and asks for nothing it does not name.",
   ["site","clinical"],"speak",None,None),
]

def nfc_len(s): return len(unicodedata.normalize("NFC", s))
def band_of(s):
    n = nfc_len(s)
    for b,(lo,hi) in H.BANDS.items():
        if lo <= n <= hi: return b, n
    return None, n

def build():
    entries = []
    for (eid, pats, resp, tags, anim, href, label) in E:
        b, n = band_of(resp)
        e = {"id": eid, "class": "oracle", "tier": "public",
             "patterns": [{"form":f,"mode":m,"weight":w} for (f,m,w) in pats],
             "response": resp, "register_tags": tags,
             "length_band": b, "animation_hint": anim}
        if href: e["href"] = href
        if label: e["nav_label"] = label
        entries.append(e)
    return {"yurei_corpus": {"schema":"0.1-oracle","tier":"public",
            "authored":"K224 Cowork — oracle/site-help slice (bounded FAQ, not open-domain QA)",
            "entries": entries}}

def gate(doc, persona_paths):
    entries = doc["yurei_corpus"]["entries"]
    fails = []
    # persona (form,mode) set for collision
    persona = set()
    for pth in persona_paths:
        for e in json.load(open(pth,encoding="utf-8"))["yurei_corpus"]["entries"]:
            for p in e.get("patterns",[]): persona.add((p["form"],p["mode"]))
    seen_forms = {}
    for e in entries:
        eid=e["id"]; resp=e["response"]
        # band present
        if e["length_band"] not in H.BANDS: fails.append(f"{eid}: bad/oversize band ({nfc_len(resp)} chars)")
        if nfc_len(resp) > 320: fails.append(f"{eid}: response > b3 max 320")
        # tags 1..3 in vocabulary
        rt=e["register_tags"]
        if not (1<=len(rt)<=3): fails.append(f"{eid}: register_tags must be 1..3")
        for t in rt:
            if t not in H.REGISTER_TAGS: fails.append(f"{eid}: bad register_tag {t!r}")
        # anim in vocabulary
        if e["animation_hint"] not in H.ANIM_HINTS: fails.append(f"{eid}: bad animation_hint")
        # patterns: stable form, mode, weight, collision
        for p in e["patterns"]:
            f,m,w=p["form"],p["mode"],p["weight"]
            if H.normalize(f)!=f: fails.append(f"{eid}: form {f!r} unstable -> {H.normalize(f)!r}")
            if m not in H.BASE: fails.append(f"{eid}: bad mode {m!r}")
            if not isinstance(w,int) or not (1<=w<=9): fails.append(f"{eid}: weight {w!r} not 1..9")
            if (f,m) in persona: fails.append(f"{eid}: COLLISION with persona (form,mode)=({f!r},{m!r})")
            if (f,m) in seen_forms: fails.append(f"{eid}: duplicate (form,mode)=({f!r},{m!r}) also {seen_forms[(f,m)]}")
            else: seen_forms[(f,m)]=eid
        # register taboo (crisis-exempt N/A here)
        low = " " + H.normalize(resp) + " "
        for pat in H.TABOO_PATTERNS:
            if re.search(pat, low): fails.append(f"{eid}: taboo /{pat}/ in response")
        if H.EMOJI_RE.search(resp): fails.append(f"{eid}: emoji")
        # punctuation gates
        if "(" in resp or ")" in resp: fails.append(f"{eid}: parentheses")
        if "!" in resp: fails.append(f"{eid}: exclamation")
        if resp.rstrip().endswith("...") or resp.rstrip().endswith("…"): fails.append(f"{eid}: trailing ellipsis")
        if resp.count("—")>1: fails.append(f"{eid}: >1 em-dash")
        if "--" in resp: fails.append(f"{eid}: -- hyphen sub")
        if not H.sentence_starts_ok(resp): fails.append(f"{eid}: lowercase sentence-start")
        for run in H.all_caps_hits(resp): fails.append(f"{eid}: ALL-CAPS {run!r}")
    # question-terminal ratio <=5%
    qterm=sum(1 for e in entries if e["response"].rstrip().endswith("?"))
    if entries and qterm/len(entries) > 0.05: fails.append(f"question-terminal {qterm}/{len(entries)} > 5%")
    # verbatim dup responses
    seen={}
    for e in entries:
        k=unicodedata.normalize("NFC",e["response"])
        if k in seen: fails.append(f"{e['id']}: verbatim-duplicate response (also {seen[k]})")
        else: seen[k]=e["id"]
    return fails

if __name__=="__main__":
    doc = build()
    persona_paths = ["yurei_corpus_public_v1.json","yurei_corpus_room_v1.json"]
    fails = gate(doc, persona_paths)
    ents = doc["yurei_corpus"]["entries"]
    from collections import Counter
    print(f"oracle entries: {len(ents)}")
    print("bands:", dict(Counter(e['length_band'] for e in ents)))
    print("tags:", dict(Counter(t for e in ents for t in e['register_tags'])))
    print("anim:", dict(Counter(e['animation_hint'] for e in ents)))
    print("with href:", sum(1 for e in ents if 'href' in e))
    if fails:
        print(f"\nGATE: {len(fails)} FAIL")
        for f in fails: print("  [FAIL]", f)
        sys.exit(1)
    print("\nGATE: 0 FAIL — schema-conformant, register-clean, zero persona collision.")
    out="/root/k224/build/src/components/yurei-corpus-oracle.json"
    if "--emit" in sys.argv:
        with open(out,"w",encoding="utf-8") as f: json.dump(doc,f,ensure_ascii=False,indent=1)
        print("emitted", out)
