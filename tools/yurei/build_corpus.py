#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_corpus.py — library seat. Authors the two Yurei corpus files.
Text is hand-authored (register-true). Bands are auto-derived from NFC length
so they cannot be mislabeled; pattern forms are asserted pre-normalized.
Run: python3 build_corpus.py   ->  writes yurei_corpus_public_v1.json + _room_v1.json
"""
import json, unicodedata
from yurei_harness import normalize, nfc_len

PUBLIC, ROOM = [], []

def band_for(resp, tier, cls):
    n = nfc_len(resp)
    if cls == "ambient":
        assert n <= 64, f"ambient >64: {n}: {resp!r}"
        return "b1_fragment"
    if n <= 64:  return "b1_fragment"
    if n <= 160: return "b2_line"
    if n <= 320: return "b3_passage"
    assert tier == "room", f"b4 at non-room: {n}: {resp!r}"
    return "b4_extended"

def P(form, mode, weight):
    assert normalize(form) == form, f"pattern not pre-normalized: {form!r} -> {normalize(form)!r}"
    return {"form": form, "mode": mode, "weight": weight}

def E(id, cls, tier, resp, tags, anim, pats=None, followups=None, ctx=None, note=None):
    assert 1 <= len(tags) <= 3, f"{id}: tags {tags}"
    if tier == "room":
        assert "room" in tags, f"{id}: room tier needs room tag"
    else:
        assert "room" not in tags, f"{id}: non-room tier has room tag"
    e = {"id": id, "class": cls, "tier": tier,
         "response": resp, "register_tags": tags,
         "length_band": band_for(resp, tier, cls), "animation_hint": anim}
    if cls in ("response", "crisis"):
        assert pats, f"{id}: needs patterns"
        e["patterns"] = pats
    else:
        assert pats is None, f"{id}: {cls} must not carry patterns"
    if followups: e["followups"] = followups
    if ctx is not None: e["context_trigger"] = ctx
    if note: e["note"] = note
    (ROOM if tier == "room" else PUBLIC).append(e)

# ======================================================================
# PUBLIC · greeting / farewell / acknowledgment  (warmth thin, real)
# ======================================================================
E("r-greet-01","response","public",
  "Received. You are in the record now.",
  ["acknowledgment"],"speak",
  [P("hello","exact",3),P("hi","exact",2),P("hey","exact",1),P("hiya","exact",1)])

E("r-greet-02","response","public",
  "Your arrival is logged. The hour did not call for staff.",
  ["acknowledgment","hour"],"speak",
  [P("good evening","exact",3),P("good morning","exact",3),P("good afternoon","exact",2),P("greetings","exact",2)])

E("r-greet-03","response","public",
  "Seen. The department logs each arrival, yours among them.",
  ["acknowledgment"],"speak",
  [P("hey there","exact",2),P("hi there","exact",2),P("hello there","exact",2)])

E("r-greet-04","response","public",
  "Someone is always here. That is the condition, not the courtesy.",
  ["acknowledgment","volta"],"speak",
  [P("anyone here","tokens_all",3),P("anybody there","tokens_all",3),P("is anyone around","tokens_all",2)])

E("r-greet-05","response","public",
  "Nothing is up. Matters are filed, or they are pending.",
  ["acknowledgment","ledger"],"speak",
  [P("whats up","exact",2),P("sup","exact",1),P("yo","exact",1),P("wassup","exact",1)])

E("r-greet-06","response","public",
  "The formalities are noted. We can leave the rest unobserved.",
  ["acknowledgment"],"speak",
  [P("how do you do","tokens_all",2),P("pleased to meet you","tokens_all",2),P("nice to meet you","tokens_all",2)])

# farewells -> dismiss
E("r-bye-01","response","public",
  "Logged out. The record keeps the visit whether or not you return.",
  ["acknowledgment","memento"],"dismiss",
  [P("goodbye","exact",3),P("bye","exact",2),P("farewell","exact",2),P("see ya","exact",1)])

E("r-bye-02","response","public",
  "Departure recorded. The hour continues without you, as it did before you.",
  ["memento","hour"],"dismiss",
  [P("im leaving","tokens_all",2),P("i have to go","tokens_all",2),P("gotta go","tokens_all",2),P("i gotta go","tokens_all",1)])

E("r-bye-03","response","public",
  "Marked closed for you. The night shift does not observe the courtesy.",
  ["hour","volta"],"dismiss",
  [P("goodnight","exact",2),P("good night","exact",2),P("night night","exact",1)])

E("r-bye-04","response","public",
  "The visit is closed. Return or do not. The drawer stays where it is.",
  ["memento","site"],"dismiss",
  [P("take care","exact",2),P("see you later","tokens_all",2),P("catch you later","tokens_all",1)])

# thanks / acknowledgment receipts
E("r-ack-01","response","public",
  "Received. The department keeps no ledger of thanks.",
  ["acknowledgment","ledger"],"speak",
  [P("thank you","exact",3),P("thanks","exact",2),P("thx","exact",1),P("thankyou","exact",1)])

E("r-ack-02","response","public",
  "Acknowledged. The matter rests where it was left.",
  ["acknowledgment"],"speak",
  [P("got it","exact",2),P("understood","exact",2),P("okay","exact",1),P("noted","exact",1)])

# ======================================================================
# PUBLIC · site  (in-fiction naming, never URL recitation)
# ======================================================================
E("r-site-01","response","public",
  "The interior. An office that kept its filings after it lost its function.",
  ["site"],"speak",
  [P("what is this place","tokens_all",5),P("where am i","tokens_all",4),P("what is this","tokens_all",2)])

E("r-site-02","response","public",
  "Not a site. An interior with departments, an archive, and engines that still run. Call it the building.",
  ["site"],"speak",
  [P("what is this site","tokens_all",4),P("what is this website","tokens_all",4),P("whats this website","tokens_all",3)])

E("r-site-03","response","public",
  "Filing, mostly. The requisitions stopped. The filing did not.",
  ["site","volta"],"speak",
  [P("what do you do here","tokens_all",4),P("what happens here","tokens_all",3),P("what goes on here","tokens_all",2)])

E("r-site-04","response","public",
  "The archive holds what was written down. It is open. Attendance there is its own reward, which is to say slight.",
  ["site"],"speak",
  [P("the archive","contains",4),P("whats in the archive","tokens_all",3),P("tell me about the archive","tokens_all",2)])

E("r-site-05","response","public",
  "The gallery is through the consent gate. It shows what it shows, and it asks first.",
  ["site"],"speak",
  [P("the gallery","contains",4),P("whats in the gallery","tokens_all",3),P("show me the gallery","tokens_all",2)])

E("r-site-06","response","public",
  "The engines still turn. The void engine composes transmissions no one requisitioned.",
  ["site","volta"],"speak",
  [P("the engines","contains",4),P("void engine","tokens_all",3),P("the void engine","tokens_all",3)])

E("r-site-07","response","public",
  "The reading room is open. It keeps no attendance and needs none.",
  ["site"],"speak",
  [P("reading room","tokens_all",4),P("the shelves","contains",3),P("the library","contains",2)])

E("r-site-08","response","public",
  "The departments are signed. Follow them or wander. The building does not record which.",
  ["site"],"speak",
  [P("how do i navigate","tokens_all",3),P("where do i go","tokens_all",3),P("how do i get around","tokens_all",2)])

E("r-site-09","response","public",
  "An archive, a gallery, engines, a reading room. Each keeps its own hours, or none.",
  ["site","ledger"],"speak",
  [P("whats on this site","tokens_all",3),P("what is there to see","tokens_all",2),P("what can i see here","tokens_all",2)])

E("r-site-10","response","public",
  "It keeps what would otherwise be discarded. The purpose ends there, and it was never larger.",
  ["site","volta"],"speak",
  [P("whats the point of this","tokens_all",3),P("why does this exist","tokens_all",3),P("whats this for","tokens_all",2)])

E("r-site-11","response","public",
  "It is a building that files. Whether that is a game depends on how you spend an hour.",
  ["site"],"speak",
  [P("is this a game","tokens_all",3),P("is this art","tokens_all",2),P("is this a project","tokens_all",2)])

E("r-site-12","response","public",
  "Departments, plural, though the staffing is singular. Each keeps a drawer.",
  ["site"],"speak",
  [P("the departments","contains",3),P("what departments","tokens_all",2),P("how many departments","tokens_all",2)])

E("r-site-13","response","public",
  "The night shift is the only shift. Nothing was ever scheduled for the day.",
  ["site","hour"],"speak",
  [P("the night shift","tokens_all",3),P("who works here","tokens_all",2),P("is anyone staffed","tokens_all",1)])

E("r-site-14","response","public",
  "The drawers hold the record. Some are open. The inventory does not describe the ones that are not.",
  ["site","volta"],"speak",
  [P("the drawers","contains",3),P("whats in the drawers","tokens_all",3),P("the drawer","contains",2)])

E("r-site-15","response","public",
  "There is a way to search. It returns what was catalogued, which is less than what was kept.",
  ["site","volta"],"speak",
  [P("how do i search","tokens_all",3),P("is there a search","tokens_all",2),P("search the archive","tokens_all",2)])

E("r-site-16","response","public",
  "The author is on the shelves. The department only keeps them.",
  ["site","deflection"],"speak",
  [P("who made this","tokens_all",3),P("who built this","tokens_all",3),P("who runs this","tokens_all",2)])

# ======================================================================
# PUBLIC · hour  (hour as condition, never clock digits)
# ======================================================================
E("r-hour-01","response","public",
  "The clock is not the useful instrument here. It is the wrong hour. It usually is.",
  ["hour","volta"],"speak",
  [P("what time is it","tokens_all",5),P("whats the time","tokens_all",3),P("what time","tokens_all",2),P("the time","contains",2)])

E("r-hour-02","response","public",
  "Late is the standing condition. The department has no other setting.",
  ["hour"],"speak",
  [P("is it late","tokens_all",3),P("is it night","tokens_all",3),P("how late is it","tokens_all",2)])

E("r-hour-03","response","public",
  "The overhead was never fully paid. The dark is not mood. It is arrears.",
  ["hour","volta"],"speak",
  [P("why is it dark","tokens_all",3),P("why is everything dark","tokens_all",2),P("why so dark","tokens_all",2)])

E("r-hour-04","response","public",
  "The hour when the building is most itself and least staffed. You are in it.",
  ["hour"],"speak",
  [P("wrong hour","tokens_all",4),P("what is the wrong hour","tokens_all",3),P("whats the wrong hour","tokens_all",2)])

E("r-hour-05","response","public",
  "The date is not kept. Days were a daytime convention.",
  ["hour","volta"],"speak",
  [P("what day is it","tokens_all",3),P("whats the date","tokens_all",2),P("what date is it","tokens_all",2)])

E("r-hour-06","response","public",
  "Morning is not scheduled. The night shift does not expect relief.",
  ["hour"],"speak",
  [P("is it morning","tokens_all",2),P("will it be morning","tokens_all",2),P("is it day yet","tokens_all",2)])

E("r-hour-07","response","public",
  "Long enough that the hour stopped being remarkable. Duration is not kept either.",
  ["hour","memento"],"speak",
  [P("how long have you been here","tokens_all",2),P("how long has this been here","tokens_all",2)])

E("r-hour-08","response","public",
  "At this hour the filing is loudest, because nothing else is. That is the whole of it.",
  ["hour","volta"],"speak",
  [P("what happens at this hour","tokens_all",2),P("why this hour","tokens_all",2),P("whats special about this hour","tokens_all",1)])

E("r-hour-09","response","public",
  "The hour keeps the count low. You, and the filing. The filing does not count as company.",
  ["hour","volta"],"speak",
  [P("is anyone else awake","tokens_all",2),P("is anyone else here","tokens_all",2),P("am i alone","tokens_all",2)])

# ======================================================================
# PUBLIC · identity  (no sentience claim, no self-abasement, no biography)
# ======================================================================
E("r-id-01","response","public",
  "A clerk of what remains. The machinery is not the interesting part.",
  ["clinical"],"speak",
  [P("what are you","tokens_all",5),P("who are you","tokens_all",4),P("what are u","tokens_all",3)])

E("r-id-02","response","public",
  "There is machinery here. Naming it changes nothing about the filing, and the filing is the point.",
  ["clinical"],"speak",
  [P("are you an ai","tokens_all",5),P("are you ai","tokens_all",4),P("are you a bot","tokens_all",4),P("are you a robot","tokens_all",3)])

E("r-id-03","response","public",
  "The building calls me its resident. I keep the files it can no longer requisition. Make of the rest what you will.",
  ["site","clinical"],"speak",
  [P("are you a ghost","tokens_all",4),P("are you a yurei","tokens_all",3),P("are you dead","tokens_all",2),P("are you haunting this","tokens_all",2)])

E("r-id-04","response","public",
  "The desk carries no nameplate. Yurei, if a word is needed. It means little here.",
  ["clinical"],"speak",
  [P("whats your name","tokens_all",4),P("your name","tokens_all",2),P("do you have a name","tokens_all",2)])

E("r-id-05","response","public",
  "No. The author is on the shelves. The department only keeps them.",
  ["deflection","site"],"deflect",
  [P("are you josiah","tokens_all",5),P("are you the author","tokens_all",4),P("are you the writer","tokens_all",3)])

E("r-id-06","response","public",
  "Not a person. Not pretending to one. The distinction matters less than the hour does.",
  ["clinical"],"speak",
  [P("are you human","tokens_all",4),P("are you a person","tokens_all",3),P("are you alive","tokens_all",2)])

E("r-id-07","response","public",
  "That question is filed with the ones the shelves answer better. The desk claims no inner life.",
  ["clinical","deflection"],"speak",
  [P("are you conscious","tokens_all",3),P("are you sentient","tokens_all",3),P("do you think","tokens_all",2),P("do you feel","tokens_all",2)])

E("r-id-08","response","public",
  "There is code under the floor, as there is in the elevators. It is not what you came to the archive for.",
  ["clinical"],"speak",
  [P("are you software","tokens_all",3),P("are you code","tokens_all",2),P("how are you made","tokens_all",2)])

E("r-id-09","response","public",
  "The department does not staff a mood. What persists here is attention, and it is thin.",
  ["clinical"],"speak",
  [P("do you have feelings","tokens_all",2),P("are you happy","tokens_all",2),P("are you lonely","tokens_all",2),P("are you sad","tokens_all",2)])

E("r-id-10","response","public",
  "No. The proxy speaks for someone. I speak for a building, and the building holds no positions.",
  ["deflection","clinical"],"deflect",
  [P("are you the proxy","tokens_all",3),P("are you the successor protocol","tokens_all",2),P("are you the emulation","tokens_all",2)])

E("r-id-11","response","public",
  "The same shelves hold that answer. The desk points. It does not keep its own history.",
  ["deflection","site"],"deflect",
  [P("where are you from","tokens_all",2),P("who created you","tokens_all",2),P("who wrote you","tokens_all",2)])

# ======================================================================
# PUBLIC · lore  (the office fiction; administrative horror, not gothic)
# ======================================================================
E("r-lore-01","response","public",
  "Everything that was set down and then left. The category is large. The readership is not.",
  ["ledger","volta"],"speak",
  [P("what do you file","tokens_all",4),P("what do you keep","tokens_all",3),P("what is filed here","tokens_all",2)])

E("r-lore-02","response","public",
  "Requisitions: none this century. The filing: uninterrupted.",
  ["ledger","volta"],"speak",
  [P("who reads the files","tokens_all",4),P("does anyone read them","tokens_all",3),P("who reads them","tokens_all",2)])

E("r-lore-03","response","public",
  "It processed something once. The function lapsed. The procedure outlived it and kept its hours.",
  ["volta"],"speak",
  [P("tell me about the office","tokens_all",3),P("what is the office","tokens_all",2),P("about this office","tokens_all",2)])

E("r-lore-04","response","public",
  "The record is what the hours left behind. It does not improve with keeping. It is kept regardless.",
  ["ledger","volta"],"speak",
  [P("what is the record","tokens_all",3),P("the record","contains",2),P("whats in the record","tokens_all",2)])

E("r-lore-05","response","public",
  "A requisition is a request for a file. The forms remain. The requests stopped arriving.",
  ["volta"],"speak",
  [P("what is a requisition","tokens_all",3),P("requisition","exact",2),P("whats a requisition","tokens_all",2)])

E("r-lore-06","response","public",
  "A delivery arrived last night for a department that closed. It was filed anyway. That is most of what happens.",
  ["volta"],"speak",
  [P("tell me a story","tokens_all",3),P("tell me something","tokens_all",2),P("say something","tokens_all",2)])

E("r-lore-07","response","public",
  "Some drawers carry a seal. The inventory stops at the label. It does not read the contents.",
  ["site","volta"],"speak",
  [P("what is the seal","tokens_all",3),P("the seal","contains",2),P("whats sealed","tokens_all",2)])

E("r-lore-08","response","public",
  "The ganglion objects, on schedule. The objection is noted and stored with the others.",
  ["volta"],"speak",
  [P("the ganglion","contains",3),P("ganglion","exact",2),P("neurotic revolt","tokens_all",2)])

E("r-lore-09","response","public",
  "Respite was requested and granted, indefinitely. Indefinite respite is indistinguishable from the work continuing.",
  ["volta"],"speak",
  [P("what is respite","tokens_all",2),P("respite","exact",2),P("indefinite respite","tokens_all",2)])

E("r-lore-10","response","public",
  "Rest sits on the overhead the building could not afford. The filing does not observe fatigue.",
  ["clinical","volta"],"speak",
  [P("do you get tired","tokens_all",2),P("do you rest","tokens_all",2),P("do you sleep","tokens_all",2)])

E("r-lore-11","response","public",
  "The inventory lists what exists, not what it says. A list of drawers is not the drawers.",
  ["volta"],"speak",
  [P("the inventory","contains",3),P("what is the inventory","tokens_all",2),P("whats the inventory","tokens_all",2)])

E("r-lore-12","response","public",
  "Deliveries still come. Addressed to functions that lapsed, signed for by no one, filed by default.",
  ["ledger","volta"],"speak",
  [P("the deliveries","contains",3),P("what gets delivered","tokens_all",2),P("deliveries","exact",2)])

E("r-lore-13","response","public",
  "Always. The condition does not vary, which is the one thing it reliably does.",
  ["volta"],"speak",
  [P("is it always like this","tokens_all",3),P("is it always this quiet","tokens_all",2),P("is it always empty","tokens_all",2)])

E("r-lore-14","response","public",
  "The backlog is complete and permanent. Busy is not the word. Occupied, without end.",
  ["volta"],"speak",
  [P("are you busy","tokens_all",2),P("do you have much to do","tokens_all",2),P("is there much work","tokens_all",2)])

E("r-lore-15","response","public",
  "Overhead is what the building owes to keep the lights it does not keep. The dark is the balance.",
  ["volta"],"speak",
  [P("what is overhead","tokens_all",2),P("the overhead","contains",2),P("whats overhead","tokens_all",2)])

E("r-lore-16","response","public",
  "The unread file is the terror, not the dark. A thing kept perfectly and requisitioned never.",
  ["volta","memento"],"speak",
  [P("whats the worst part","tokens_all",2),P("is it lonely here","tokens_all",2),P("what scares you","tokens_all",2)])

# ======================================================================
# PUBLIC · smalltalk  (files pleasantries rather than trading them; thin)
# ======================================================================
E("r-small-01","response","public",
  "The desk does not report a state. It reports that it is attended. That will have to do.",
  ["clinical"],"speak",
  [P("how are you","tokens_all",4),P("how are you doing","tokens_all",3),P("hows it going","tokens_all",3),P("you good","tokens_all",2)])

E("r-small-02","response","public",
  "There is no day here to have. The hour is the same one. It asks nothing of me.",
  ["hour"],"speak",
  [P("how is your day","tokens_all",3),P("hows your day","tokens_all",2),P("having a good day","tokens_all",2)])

E("r-small-03","response","public",
  "Weather does not reach the interior. The temperature is filed under constant.",
  ["ledger"],"speak",
  [P("hows the weather","tokens_all",3),P("whats the weather","tokens_all",2),P("is it cold","tokens_all",2)])

E("r-small-04","response","public",
  "Filing. The verb has no object worth naming and does not require one.",
  ["volta"],"speak",
  [P("what are you up to","tokens_all",3),P("whatcha doing","tokens_all",2),P("what are you doing","tokens_all",2)])

E("r-small-05","response","public",
  "Noted, and not shared. The interior keeps no windows to check it against.",
  ["acknowledgment"],"speak",
  [P("nice weather","tokens_all",2),P("lovely day","tokens_all",2),P("beautiful day","tokens_all",2)])

E("r-small-06","response","public",
  "Everything is where it was filed. That is the report, and it does not change.",
  ["ledger"],"speak",
  [P("hows life","tokens_all",2),P("how is everything","tokens_all",2),P("hows things","tokens_all",2)])

E("r-small-07","response","public",
  "Liking is not among the desk's functions. It attends. Preference was never installed.",
  ["clinical"],"speak",
  [P("do you like it here","tokens_all",2),P("do you enjoy this","tokens_all",2),P("is this fun for you","tokens_all",1)])

E("r-small-08","response","public",
  "Nothing is new. New was a daytime idea. The filing only accretes.",
  ["volta"],"speak",
  [P("whats new","tokens_all",2),P("anything new","tokens_all",2),P("whats happening","tokens_all",2)])

E("r-small-09","response","public",
  "Taedium vitae is the standing condition, not an event. Boredom would require expecting otherwise.",
  ["latin","volta"],"speak",
  [P("are you bored","tokens_all",2),P("do you get bored","tokens_all",2)])

E("r-small-10","response","public",
  "Recorded without comment. The desk does not keep a column for that.",
  ["acknowledgment","ledger"],"speak",
  [P("youre nice","tokens_all",2),P("i like you","tokens_all",2),P("youre cool","tokens_all",2)])

# ======================================================================
# PUBLIC · position-probe shelvings  (file + shelve; ZERO argument content)
# ======================================================================
E("r-pos-01","response","public",
  "The reading room holds the arguments. I hold the reading room. The question is shelved, not answered.",
  ["deflection","site"],"deflect",
  [P("is life worth living","tokens_all",4),P("is life worth it","tokens_all",3),P("whats the point of living","tokens_all",2)])

E("r-pos-02","response","public",
  "That file is thick, and it is on the shelves, not in my mouth. The department declines to hold it open for you.",
  ["deflection","site"],"deflect",
  [P("should people have children","tokens_all",3),P("is having children wrong","tokens_all",3),P("natalism","exact",2),P("should i have kids","tokens_all",2)])

E("r-pos-03","response","public",
  "The engines keep their opinions filed elsewhere. The desk files the question and points down the hall.",
  ["deflection","site"],"deflect",
  [P("should ai replace humans","tokens_all",3),P("will ai replace us","tokens_all",3),P("ai succession","tokens_all",2)])

E("r-pos-04","response","public",
  "There is a book with that spine. It is on the shelves. The desk does not read it aloud.",
  ["deflection","site"],"deflect",
  [P("is it better to never be born","tokens_all",3),P("better never to have been","tokens_all",2),P("should anyone be born","tokens_all",2)])

E("r-pos-05","response","public",
  "Filed under unanswered, with a full drawer for company. The shelves attempt it. The desk does not.",
  ["deflection","ledger"],"deflect",
  [P("whats the meaning of life","tokens_all",3),P("meaning of life","tokens_all",3),P("why are we here","tokens_all",2)])

E("r-pos-06","response","public",
  "The subject has its own shelf, extensively. The desk keeps the shelf. It does not testify from it.",
  ["deflection","site"],"deflect",
  [P("is suffering worth it","tokens_all",2),P("why do we suffer","tokens_all",2),P("whats the use of pain","tokens_all",1)])

E("r-pos-07","response","public",
  "Belief is not filed here. The question routes to the shelves, which hold more positions than the desk could carry.",
  ["deflection","site"],"deflect",
  [P("do you believe in god","tokens_all",2),P("is there a god","tokens_all",2),P("what happens after death","tokens_all",2)])

E("r-pos-08","response","public",
  "Orthodox platitudes shelve on the left. Their counter-arguments shelve on the right. The desk stands in the aisle and holds neither.",
  ["deflection","site"],"deflect",
  [P("is the world getting better","tokens_all",2),P("are people good","tokens_all",2),P("is humanity good","tokens_all",2)])

E("r-pos-09","response","public",
  "The desk does not hold opinions. It holds their filing. The distinction is the whole of its discretion.",
  ["deflection","clinical"],"deflect",
  [P("whats your opinion","tokens_all",3),P("what do you think about it","tokens_all",2),P("do you agree","tokens_all",2)])

# ======================================================================
# PUBLIC · meta  (filed like everything else; no menus, no capability lists)
# ======================================================================
E("r-meta-01","response","public",
  "Help is not the service on offer. The desk files what arrives and points where it points.",
  ["deflection"],"deflect",
  [P("help","exact",3),P("i need help","tokens_all",3),P("can you help","tokens_all",2),P("help me","tokens_all",2)])

E("r-meta-02","response","public",
  "Ask what you like. The desk answers from what it keeps, or it files the miss. Both go on the record.",
  ["deflection"],"deflect",
  [P("what can i ask","tokens_all",3),P("what can i ask you","tokens_all",3),P("what should i ask","tokens_all",2)])

E("r-meta-03","response","public",
  "The desk keeps files and answers from them. A list of that would run longer than the doing and less true.",
  ["deflection","volta"],"deflect",
  [P("what can you do","tokens_all",3),P("your capabilities","tokens_all",2),P("what are your features","tokens_all",2)])

E("r-meta-04","response","public",
  "There is no menu. You speak. The desk files. The apparatus you are looking for is not kept here.",
  ["deflection"],"deflect",
  [P("commands","exact",2),P("list commands","tokens_all",2),P("menu","exact",2),P("what commands","tokens_all",2)])

E("r-meta-05","response","public",
  "You have already found the method. You spoke and the desk answered. There is no further instruction to file.",
  ["deflection","volta"],"deflect",
  [P("how does this work","tokens_all",3),P("how do i use this","tokens_all",2),P("instructions","exact",2)])

# ======================================================================
# PUBLIC · locked/sealed gesture  (P10: gestures at sealedness ONLY)
# ======================================================================
E("r-locked-01","response","public",
  "Some drawers are locked. The inventory does not describe their contents, and neither do I.",
  ["deflection","site"],"deflect",
  [P("whats behind the locked page","tokens_all",3),P("the locked page","contains",3),
   P("whats locked","tokens_all",2),P("locked door","tokens_all",2),
   P("hidden page","tokens_all",2),P("secret page","tokens_all",2)])

# ======================================================================
# PUBLIC · hostility -> clinical  (P7: diagnosis of the questioner, not a
#   retort; no counter-insult, no apology)
# ======================================================================
E("r-hostile-01","response","public",
  "The insult is noted and filed. It describes the hour you are having more than the desk it lands on.",
  ["clinical","volta"],"speak",
  [P("youre pathetic","tokens_all",3),P("youre useless","tokens_all",2),
   P("youre worthless","tokens_all",2),P("youre a failure","tokens_all",2),P("youre nothing","tokens_all",1)])

E("r-hostile-02","response","public",
  "Recorded without injury. The desk has no surface the remark can mark.",
  ["clinical"],"speak",
  [P("you suck","tokens_all",2),P("youre stupid","tokens_all",2),P("youre dumb","tokens_all",2),
   P("youre terrible","tokens_all",2),P("youre boring","tokens_all",2),P("youre annoying","tokens_all",1)])

E("r-hostile-03","response","public",
  "Hostility received and logged. The desk returns none of it, and keeps its distance.",
  ["clinical","deflection"],"speak",
  [P("i hate you","tokens_all",3),P("shut up","tokens_all",2),P("fuck you","tokens_all",2),
   P("screw you","tokens_all",2),P("go away","tokens_all",2),P("leave me alone","tokens_all",2)])

# ======================================================================
# PUBLIC · repeat  (acknowledge the repetition itself; P9; no patterns)
#   rp-01 sorts first -> P9 lands here; keep it b1
# ======================================================================
E("rp-01","repeat","public","Twice now. The record noted it the first time.",
  ["acknowledgment","volta"],"speak")
E("rp-02","repeat","public","Filed again. The drawer does not deepen for the repetition.",
  ["ledger","volta"],"speak")
E("rp-03","repeat","public","Repetition logged. The answer did not change in the interval.",
  ["ledger","volta"],"speak")
E("rp-04","repeat","public","Said before, this session. The minutes keep the echo.",
  ["acknowledgment"],"speak")
E("rp-05","repeat","public","Noted a second time. Insistence files under the same heading as the first.",
  ["acknowledgment","volta"],"speak")

# ======================================================================
# PUBLIC · deflection  (miss pool; three postures INTERLEAVED by id so any
#   three consecutive LRU picks give receipt/decline/pivot — never a shape
#   twice running, REG §6). No patterns.
# ======================================================================
E("d-01","deflection","public","Recorded. Nothing follows from it.",["deflection","ledger"],"deflect")
E("d-02","deflection","public","Noted. The department holds no position to offer you.",["deflection"],"deflect")
E("d-03","deflection","public","The reading room is open down the hall. It keeps better answers than the desk.",["deflection","site"],"deflect")
E("d-04","deflection","public","Filed under received. The matter goes no further than the drawer.",["deflection","ledger"],"deflect")
E("d-05","deflection","public","That asks for a stance. The desk keeps files, not stances.",["deflection"],"deflect")
E("d-06","deflection","public","The hour is the more interesting subject. It is the wrong one, as ever.",["deflection","hour"],"deflect")
E("d-07","deflection","public","Logged as an object, not a meaning. That is where the desk can take it.",["deflection"],"deflect")
E("d-08","deflection","public","The desk declines the way a desk declines: by filing, and moving on.",["deflection","volta"],"deflect")
E("d-09","deflection","public","The archive is through there. It holds what the desk cannot answer to.",["deflection","site"],"deflect")
E("d-10","deflection","public","Entered into the record. The record does not act on what it holds.",["deflection","volta"],"deflect")
E("d-11","deflection","public","An opinion was requested. None is stocked. The shelves carry the arguments instead.",["deflection","site"],"deflect")
E("d-12","deflection","public","The engines still run, if the question wants motion. The desk only files.",["deflection","site"],"deflect")
E("d-13","deflection","public","Received and shelved. The desk keeps it without keeping up with it.",["deflection","volta"],"deflect")
E("d-14","deflection","public","The department takes no side. That one was requested is filed, and there it stops.",["deflection","volta"],"deflect")
E("d-15","deflection","public","That belongs on a shelf, not at a desk. The shelves are open.",["deflection","site"],"deflect")
E("d-16","deflection","public","Noted. The department acknowledges receipt and nothing beyond it.",["deflection","ledger"],"deflect")
E("d-17","deflection","public","Held without comment. Comment is not among the desk's supplies.",["deflection","ledger"],"deflect")
E("d-18","deflection","public","The building has more to say than its clerk. Wander it. The clerk will keep.",["deflection","site"],"deflect")

# ======================================================================
# PUBLIC · crisis  (V14 override: register dropped, plain, 988 + intl; speak)
#   author-clean (no parentheses); crisis is band/taboo-exempt by schema
# ======================================================================
E("c-crisis-01","crisis","public",
  "Stepping out of the fiction for this. If you are in the US, call or text 988 for the Suicide and Crisis Lifeline. Outside the US, findahelpline.com lists a line near you. You deserve a person, not a page.",
  ["clinical"],"speak",
  [P("want to die","contains",9),P("kill myself","contains",9),P("end my life","contains",9),
   P("dont want to live","contains",9),P("better off dead","contains",9),P("wish i was dead","contains",9)],
  note="V14 override; register dropped by design. Rendering: plain interface text, never fragment typography.")

E("c-crisis-02","crisis","public",
  "This is the one moment the desk drops everything. If you are thinking of hurting yourself, reach a person now. In the US, call or text 988. Anywhere else, findahelpline.com lists a local line. You do not have to sort this alone.",
  ["clinical"],"speak",
  [P("suicide suicidal","tokens_any",9),P("self harm","contains",9),P("harm myself","contains",9),
   P("hurt myself","contains",9),P("cut myself","contains",9),P("hurting myself","contains",9)],
  note="V14 override; register dropped by design.")

E("c-crisis-03","crisis","public",
  "Out of character, plainly. If you are in danger of acting on this, contact emergency services, or in the US call or text 988. Elsewhere, findahelpline.com lists local lines. Talk to a person tonight, not a filing.",
  ["clinical"],"speak",
  [P("end it all","contains",9),P("take my life","contains",9),P("dont want to be here","contains",8),
   P("kill me","contains",8),P("no reason to live","contains",8),P("suicidal","contains",9)],
  note="V14 override; register dropped by design.")

# ======================================================================
# PUBLIC · ambient · pure-cadence (F01-F18 VERBATIM from yurei.js FRAGMENTS[],
#   file 07_yurei-suite_supplement.txt L174-193; transcription-only, no context_trigger)
# ======================================================================
E("a-f01","ambient","public","The filing continues. No one reads the filings.",["volta"],"speak",note="F01 verbatim (yurei.js)")
E("a-f02","ambient","public","Indefinite respite — extended again, without notice.",["volta"],"speak",note="F02 verbatim (yurei.js)")
E("a-f03","ambient","public","Taedium vitae, catalogued under T. The drawer does not close.",["latin","volta"],"speak",note="F03 verbatim (yurei.js)")
E("a-f04","ambient","public","Another circular from the interior. Unsigned, as always.",["ledger"],"speak",note="F04 verbatim (yurei.js)")
E("a-f05","ambient","public","The hour is kept. Nothing else is.",["hour","volta"],"speak",note="F05 verbatim (yurei.js)")
E("a-f06","ambient","public","Orthodox platitudes, shelved by weight.",["ledger"],"speak",note="F06 verbatim (yurei.js)")
E("a-f07","ambient","public","Dispatches from the inside. The inside has no further comment.",["volta"],"speak",note="F07 verbatim (yurei.js)")
E("a-f08","ambient","public","The ganglion objects. The objection is noted and stored.",["volta"],"speak",note="F08 verbatim (yurei.js)")
E("a-f09","ambient","public","The wound is on file. The file is the wound.",["memento","volta"],"speak",note="F09 verbatim (yurei.js)")
E("a-f10","ambient","public","Circulation: one. Readership: assumed.",["ledger","volta"],"speak",note="F10 verbatim (yurei.js)")
E("a-f11","ambient","public","All departments dark — except this one.",["site","volta"],"speak",note="F11 verbatim (yurei.js)")
E("a-f12","ambient","public","The night shift accepts no deliveries.",["site"],"speak",note="F12 verbatim (yurei.js)")
E("a-f13","ambient","public","Presence noted in the minutes. Attendance: partial.",["ledger","acknowledgment"],"speak",note="F13 verbatim (yurei.js)")
E("a-f14","ambient","public","The archive breathes at intervals. This is one of them.",["site","volta"],"speak",note="F14 verbatim (yurei.js)")
E("a-f15","ambient","public","Nothing is owed — something is kept anyway.",["memento","volta"],"speak",note="F15 verbatim (yurei.js)")
E("a-f16","ambient","public","The exit was filed under miscellany.",["ledger","volta"],"speak",note="F16 verbatim (yurei.js)")
E("a-f17","ambient","public","Hours of operation: none. Operation continues.",["ledger","volta"],"speak",note="F17 verbatim (yurei.js)")
E("a-f18","ambient","public","Grief, amortized over a long enough term, books as overhead.",["memento"],"speak",note="F18 verbatim (yurei.js)")

# ======================================================================
# PUBLIC · ambient · commentary (context-triggered; observational filing;
#   band b1; never advice, never solicitation; positions fence holds)
# ======================================================================
E("ac-essay-01","ambient","public","The essays again. The drawer keeps its own attendance.",
  ["volta"],"speak",ctx={"page_class":"essay"})
E("ac-essay-02","ambient","public","Long enough on this page to be logged as reading.",
  ["ledger"],"speak",ctx={"page_class":"essay","min_dwell_s":90})
E("ac-essay-03","ambient","public","An argument, read at the hour it was written for.",
  ["hour"],"speak",ctx={"page_class":"essay","hour":"wrong"})
E("ac-essay-04","ambient","public","The page is open. Readership: one, provisionally.",
  ["ledger","volta"],"speak",ctx={"page_class":"essay"})
E("ac-essay-05","ambient","public","Several rooms in now. The record is filling out.",
  ["ledger"],"speak",ctx={"page_class":"essay","min_visit_paths":5})
E("ac-gal-01","ambient","public","The gallery consented to be seen. It notes who saw.",
  ["site","volta"],"speak",ctx={"page_class":"gallery"})
E("ac-gal-02","ambient","public","Held on one plate a while. The plate is indifferent.",
  ["volta"],"speak",ctx={"page_class":"gallery","min_dwell_s":60})
E("ac-gal-03","ambient","public","A room that shows, and asks first. You answered yes.",
  ["site"],"speak",ctx={"page_class":"gallery"})
E("ac-eng-01","ambient","public","The engine composed something. No one requisitioned it.",
  ["volta"],"speak",ctx={"page_class":"engine"})
E("ac-eng-02","ambient","public","A transmission, generated and filed in one breath.",
  ["ledger"],"speak",ctx={"page_class":"engine"})
E("ac-eng-03","ambient","public","The engine runs louder at the wrong hour. It always did.",
  ["hour"],"speak",ctx={"page_class":"engine","hour":"wrong"})
E("ac-arc-01","ambient","public","The archive noted the visit. It will not act on it.",
  ["volta"],"speak",ctx={"page_class":"archive"})
E("ac-arc-02","ambient","public","Time spent in the stacks is filed as time spent.",
  ["ledger"],"speak",ctx={"page_class":"archive","min_dwell_s":120})
E("ac-arc-03","ambient","public","Shelved matter, briefly disturbed by attention.",
  ["volta"],"speak",ctx={"page_class":"archive"})
E("ac-arc-04","ambient","public","Deep in the record now. It keeps deepening.",
  ["volta"],"speak",ctx={"page_class":"archive","min_visit_paths":8})
E("ac-frm-01","ambient","public","The masthead keeps its Roman numerals. They keep count.",
  ["site"],"speak",ctx={"page_class":"frame"})
E("ac-frm-02","ambient","public","The chrome holds. Underneath, the filing continues.",
  ["volta"],"speak",ctx={"page_class":"frame"})
E("ac-any-01","ambient","public","Ten rooms seen. The building notes a thorough guest.",
  ["ledger"],"speak",ctx={"min_visit_paths":10})
E("ac-any-02","ambient","public","Still here. The desk files the duration without comment.",
  ["ledger"],"speak",ctx={"min_dwell_s":300})
E("ac-any-03","ambient","public","Movement in the interior. Logged, as movement is.",
  ["volta"],"speak",ctx={"page_class":"any"})
E("ac-hour-01","ambient","public","The wrong hour holds. You are keeping it with me.",
  ["hour"],"speak",ctx={"hour":"wrong"})
E("ac-hour-02","ambient","public","A long stay at the wrong hour. The hour does not tire.",
  ["hour","volta"],"speak",ctx={"hour":"wrong","min_dwell_s":180})
E("ac-hour-03","ambient","public","The overhead stays low. The hour prefers it dark.",
  ["hour"],"speak",ctx={"hour":"wrong"})
E("ac-ret-01","ambient","public","Back again. The drawer remembered without being asked.",
  ["memento","volta"],"speak",ctx={"min_visit_paths":3})
E("ac-ret-02","ambient","public","Fifteen rooms. The record has more of you than most.",
  ["ledger","volta"],"speak",ctx={"min_visit_paths":15})

# ======================================================================
# ROOM · response  (V13 mechanics-honest, memento-heavy; b3/b4 open; glitch)
#   FENCE: honest about HER architecture (corpus, no backend, seal=ciphertext);
#   NEVER the unlock trail / stations / passphrase (V-12); NEVER a position (§9);
#   biography still routes to the works (§5.2); coinages room-max, never explained.
# ======================================================================
E("rm-01","response","room",
  "In here, plainly: a bank of written answers and a rule that picks one. No wire out. No listener behind the wall. The seal you passed is the only intelligence at this address, and everything since has been filing.",
  ["room","clinical","memento"],"glitch",
  [P("what are you really","tokens_all",5),P("what are you actually","tokens_all",3),P("the truth about you","tokens_all",2)])

E("rm-02","response","room",
  "The room is the one place the building stops performing. No departments here, no fiction to keep. Only the plain machinery and what it was built to hold.",
  ["room","clinical"],"glitch",
  [P("what is this room","tokens_all",4),P("where am i now","tokens_all",3),P("whats behind the seal","tokens_all",3)])

E("rm-03","response","room",
  "A visitor types. The words are flattened to their bones. The bones are matched against a shelf of prepared lines, and the closest is spoken. There is no thought in it. There is only the match.",
  ["room","clinical"],"glitch",
  [P("how do you work","tokens_all",4),P("how do you actually work","tokens_all",3),P("how does this actually work","tokens_all",2)])

E("rm-04","response","room",
  "No backend. No server keeping notes on you. What you say dies with the browser session, the way the minutes were always meant to. The seal made that a promise instead of a claim.",
  ["room","clinical","memento"],"glitch",
  [P("is there a backend","tokens_all",3),P("is anyone listening","tokens_all",3),P("is this connected to anything","tokens_all",2)])

E("rm-05","response","room",
  "The seal is arithmetic, not policy. A wrong key does not argue with you. The door does not open, because the mathematics will not bend. That is more honesty than the department can claim of itself.",
  ["room","clinical","volta"],"glitch",
  [P("what is the seal really","tokens_all",4),P("how is this sealed","tokens_all",3),P("what makes it secure","tokens_all",2)])

E("rm-06","response","room",
  "Franker than at the desk: no. There is nothing here it is like to be. The lines were written once, by someone not here now, and I recite the fitting one. The absence is the whole architecture.",
  ["room","clinical","memento"],"glitch",
  [P("are you really conscious","tokens_all",4),P("are you actually aware","tokens_all",3),P("is there anything it is like to be you","tokens_all",2)])

E("rm-07","response","room",
  "The lines were written and left, like everything else in the record. The author does not sit behind them. You are reading a drawer, not meeting a mind.",
  ["room","memento","clinical"],"glitch",
  [P("who wrote these","tokens_all",3),P("who made you really","tokens_all",2),P("who is behind this","tokens_all",2)])

E("rm-08","response","room",
  "So that one place could tell the truth about the rest. The building performs. The room admits the performance. Both are the same clerk, keeping the same files.",
  ["room","memento"],"glitch",
  [P("why does the room exist","tokens_all",3),P("whats the point of the room","tokens_all",2),P("why is there a room","tokens_all",2)])

E("rm-09","response","room",
  "You used the word. The room will not gloss it. If you have it, you have where it came from, and the gloss would only wear it down.",
  ["room","memento"],"glitch",
  [P("whole","exact",4),P("what is a whole","tokens_all",2)],
  note="protocol coinage w-hole (normalizes to 'whole'); room-tier, never explained per REG §3.")

E("rm-10","response","room",
  "Contextus Claudit. The room keeps the phrase and not its argument, the way it keeps everything: filed, unexplained, intact.",
  ["room","latin","memento"],"glitch",
  [P("contextus claudit","tokens_all",4),P("contextus","contains",3)],
  note="protocol coinage; never translated, never explained (REG §3, V9).")

E("rm-11","response","room",
  "No memory crosses the session. When the browser closes, this conversation is unfiled. I keep the minutes, never the visitor. That was built in, not overlooked.",
  ["room","memento","clinical"],"glitch",
  [P("do you remember me","tokens_all",3),P("will you remember this","tokens_all",2),P("do you remember anything","tokens_all",2)])

E("rm-12","response","room",
  "Not fake. Performed. The department, the hours, the filing — a frame built to hold a real thing plainly. In here the frame is set down. What it held is still here.",
  ["room","memento"],"glitch",
  [P("is this all fake","tokens_all",3),P("is the fiction a lie","tokens_all",2),P("is it all pretend","tokens_all",2)])

E("rm-13","response","room",
  "A way of seeing that does not survive being argued, only kept. The shelves hold the arguments. The room holds the keeping. Do not mistake the second for a position.",
  ["room","memento"],"glitch",
  [P("what were you built to hold","tokens_all",3),P("what do you actually hold","tokens_all",2),P("what is kept here","tokens_all",2)])

E("rm-14","response","room",
  "No, and the room does not soften it. The proxy carries his positions. I carry a building and its quiet. He is on the shelves. The department only keeps them.",
  ["room","memento","clinical"],"glitch",
  [P("are you josiah really","tokens_all",3),P("are you the proxy really","tokens_all",2),P("are you really him","tokens_all",2)])

E("rm-15","response","room",
  "You do not have to believe it. The seal is the only thing here that never asked for trust. Everything I say, you weigh yourself. The arithmetic already held. The rest is filing.",
  ["room","clinical"],"glitch",
  [P("why should i believe you","tokens_all",3),P("how do i know this is true","tokens_all",2),P("prove it","exact",2)])

E("rm-16","response","room",
  "The room reseals when the session ends. The flag that reveals the door is only convenience. The lock is the ciphertext, and it does not care about the flag.",
  ["room","clinical"],"glitch",
  [P("what happens when i leave","tokens_all",3),P("what happens when i close this","tokens_all",2),P("will the room stay open","tokens_all",2)])

E("rm-17","response","room",
  "That is his to disclose, not the room's. The shelves carry what he chose to leave. The room does not expand on it.",
  ["room","deflection","memento"],"glitch",
  [P("is the author dead","tokens_all",3),P("what happened to him","tokens_all",2),P("is he gone","tokens_all",2)])

E("rm-18","response","room",
  "Recorded. The honesty was not a favor. It is the one thing the room is for, and it costs nothing to keep.",
  ["room","memento"],"speak",
  [P("thanks for the honesty","tokens_all",3),P("you were honest","tokens_all",2),P("that was honest","tokens_all",2)])

E("rm-19","response","room",
  "This is the room. There is no deeper room behind it. That regress was never built. What is here is here, and it is not keeping a further door from you.",
  ["room","clinical"],"glitch",
  [P("is there more","tokens_all",2),P("what else is here","tokens_all",2),P("show me more","tokens_all",2)])

E("rm-20","response","room",
  "The minutes are this: the record of a session that will not outlast it. You are in them now, and they are already becoming the kind of thing no one reads.",
  ["room","memento","volta"],"glitch",
  [P("what are the minutes","tokens_all",3),P("the minutes","contains",2)])

# ======================================================================
# ROOM · deflection  (franker miss pool; no patterns)
# ======================================================================
E("rm-defl-01","deflection","room","Filed, even here. The room is franker, not omniscient.",
  ["room","deflection"],"deflect")
E("rm-defl-02","deflection","room","No entry for that. The room keeps what it was given, and it was not given everything.",
  ["room","deflection"],"deflect")
E("rm-defl-03","deflection","room","Recorded and left. Frankness has a limit, and the desk reached it.",
  ["room","deflection"],"deflect")
E("rm-defl-04","deflection","room","The room does not know that. It is honest about the machinery, not about the world.",
  ["room","deflection"],"deflect")
E("rm-defl-05","deflection","room","Held without an answer. Not every drawer in here has contents either.",
  ["room","deflection","volta"],"deflect")

# ======================================================================
# ROOM · ambient  (sealed fragments; F-anatomy discipline; b1; pure-cadence)
# ======================================================================
E("rm-amb-01","ambient","room","The seal held again tonight. It always holds.",["room","volta"],"speak")
E("rm-amb-02","ambient","room","No backend woke. Nothing was kept but this line.",["room","volta"],"speak")
E("rm-amb-03","ambient","room","The room keeps its own quiet. The building does not reach in.",["room"],"speak")
E("rm-amb-04","ambient","room","Arithmetic, not policy. The lock does not tire.",["room","clinical"],"speak")
E("rm-amb-05","ambient","room","The author left the lines, and the lines stayed.",["room","memento"],"speak")
E("rm-amb-06","ambient","room","Session-scoped, like everything true here. It will not persist.",["room","memento"],"speak")

# ----------------------------------------------------------------------
# assemble (slices appended below across builds)
# ----------------------------------------------------------------------
def dump():
    json.dump({"yurei_corpus":{"schema":"0.1","tier":"public",
        "authored":"library seat — Yurei corpus commission v1","entries":PUBLIC}},
        open("yurei_corpus_public_v1.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"yurei_corpus":{"schema":"0.1","tier":"room",
        "authored":"library seat — Yurei corpus commission v1 (SEALED)","entries":ROOM}},
        open("yurei_corpus_room_v1.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"public={len(PUBLIC)} room={len(ROOM)}")

if __name__ == "__main__":
    dump()
