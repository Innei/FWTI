# FWTI 十六型 + 八隐藏人格画像 — AI 生图 Prompt Kit

## 2. 共用 Base Prompt（一贯到底，十六型与隐藏人格皆用）

```
A single full-body character illustration in the style of 16personalities.com,
flat vector art with faceted polygon shading, soft highlights and muted shadows,
desaturated editorial palette, stylized semi-realistic proportions,
centered composition on a 1:1 square canvas, soft radial gradient background
with a subtle floor shadow, clean geometric shading without harsh outlines,
grounded natural pose, contemporary clothing with clearly faceted fabric folds,
personality expressed through one signature prop and posture, editorial character art
```

## 3. Negative Prompt（避之）

```
anime, manga, chibi, heavy black outlines, realistic photo, 3D render,
oil painting, watercolor texture, pixel art, messy linework, sketchy,
busy cluttered background, multiple characters, text, typography, logo,
watermark, distorted hands, extra fingers, low resolution
```

---

## 5. 十六型 Subject Prompts

> 格式：每型列出「subject 段」，直接插入 base prompt **前端**使用，形如：
>
> ```
> <Subject>. <Base prompt> <Family color cue>.
> ```

### 家族底色线索（Family color cue）


| Family      | 家族名       | cue 字段（接 base prompt 尾）                                                                                                            |
| ----------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **GZ**      | 激进家（冲·炸）  | `, background tinted soft violet #88619a`                                                                                          |
| **GR**      | 隐忍家（冲·忍）  | `, background tinted warm mustard #e4ae3a`                                                                                         |
| **DZ**      | 内爆家（蹲·炸）  | `, background tinted dusty blue #4298b4`                                                                                           |
| **DR**      | 隐身家（蹲·忍）  | `, background tinted sage green #33a474`                                                                                           |
| **ALL**     | 隐藏家（我全都要） | `, background radiating four faint color wedges (violet, mustard, dusty blue, sage green) from a hollow slate grey center #6b7280` |
| **HIDDEN+** | 隐藏彩蛋家（七人） | 每位独立配色，见 §5 各条目（RAT / PURE / MAD / E-DOG / CHAOS / CPU / BENCH）                                                                    |


---

### 🟣 GZ · 激进家

#### GZNY — 自爆卡车 · BOOM

> 爱你爱到自毁，怀疑你怀疑到自闭

```
A young person in a cropped crimson bomber jacket and dark jeans, wild windswept hair,
wide panicked bloodshot eyes with a single welling tear, clutching a lit stick of
dynamite in one hand with the fuse sparking, phone in the other hand showing an
unread message thread, leaning forward in an unstable pose, torn paper scraps and
a faint red blast cloud curling behind them
```

#### GZNF — 恋爱脑 · DAZE

> 脑子空了，全是你

```
A dreamy young person in pastel pink sweater and soft jeans, heart-shaped glints in
their pupils, arms wrapped around an oversized bouquet of roses with a smartphone
tucked among the stems showing a chat bubble, tilted-head smile of complete devotion,
feet barely touching the ground, rose petals drifting upward around them
```

#### GZLY — 醋王 · SOUR

> 我不是在吃醋，我是在喝醋

```
A sharp stylish woman in a tailored blazer and silk blouse, one hand squeezing a
half-cut lemon that drips onto the floor, the other hand gripping a phone showing
a social media post with a flagged heart reaction, narrowed suspicious eyes with
one raised eyebrow, tight smirk, a faint yellow citrus aura around the lemon
```

#### GZLF — 海王 / 浪子 · WILD

> 爱得热烈，走得潇洒，鱼塘永远在扩建

```
A confident free-spirited person in a leather jacket over a graphic tee, balancing
one foot on a skateboard, windswept hair, wide carefree grin, giving a two-finger
salute goodbye, a trail of tiny faded hearts drifting behind them like exhaust,
a few small chat bubbles from multiple conversations floating at different distances
in the background to suggest many simultaneous flirtations
```

---

### 🟡 GR · 隐忍家

#### GRNY — 卑微战士 · DUST

> 把自己低到尘埃里，还觉得尘埃嫌弃我

```
A humble young person in earthy brown workwear kneeling on one knee, offering up a
tray with coffee and a small wrapped gift like a tribute, shoulders hunched forward,
anxious apologetic half-smile, a single bead of sweat on the forehead, fine dust
particles drifting around their knees
```

#### GRNF — 舔狗 · SIMP

> 你骂我我汪汪叫，你打我我摇尾巴

```
A cheerful person in a soft beige hoodie with faux puppy-ear headband, tongue
slightly out in happy panting, holding the loose end of a red leash that trails
off-frame, heart-shaped highlights in their eyes, wagging body language, an
invisible tail wag suggested by motion lines
```

#### GRLY — 钓系大师 · BAIT

> 我不是在恋爱，我在下棋

```
A cool calculating person in a dark turtleneck and long coat, seated on a high
stool, holding a slender fishing rod with a tiny pink heart dangling as bait,
glancing sideways with a knowing half-smile, a single chess piece balanced on
their knee, dim spotlight from above
```

#### GRLF — 正常人 · SANE

> 理论上存在的生物

```
A well-adjusted balanced person in neat casual clothes (cardigan over shirt),
relaxed standing pose, holding a coffee cup in one hand and an open paperback in
the other, warm genuine unforced smile, no drama props, clean minimal background,
serene and composed, with a very faint scientific-specimen-label style frame
around the figure as if they were a rare documented species
```

---

### 🔵 DZ · 内爆家

#### DZNY — 定时炸弹 · TICK

> 表面风平浪静，内心已经核爆十七次了

```
A quiet polite person in a neat button-up shirt sitting stiffly on a wooden stool,
strained thin-lipped smile, hands folded tightly in their lap, a subtle cartoon bomb
with a visible countdown timer peeking from inside the shirt collar, faint red
anger marks floating above the head, eye twitching slightly
```

#### DZNF — 林黛玉 · WILT

> 风吹一下我就能哭半小时

```
A delicate melancholic person in layered soft-hued hanfu-inspired top, seated among
falling cherry blossom petals, tears streaming down both cheeks, clutching a small
embroidered handkerchief to their mouth, head tilted downward in sorrow, long hair
gently wind-blown, a single drooping wilting flower held loosely in their other
hand with petals beginning to fall, the whole posture suggesting a body visibly
wilting under the slightest emotional breeze
```

#### DZLY — 刺猬 · OUCH

> 别靠近我！……你怎么真走了？

```
A prickly-looking person with spiky tousled hair in an oversized studded denim
jacket covered in metallic thorns, arms crossed defensively across the chest, a
scowl on the face but with wet shining eyes, a tiny glowing pink heart barely
visible peeking out between the jacket spikes on their chest
```

#### DZLF — 猫系恋人 · MEOW

> 叫你别碰我，没叫你走啊

```
An aloof person with faux cat-ear headband and cat-tail belt accessory, languidly
draped across a sunlit windowsill, one hand dangling lazily with a ball of yarn
dropping from their fingers, half-lidded eyes, small smug private smile, soft
afternoon light
```

---

### 🟢 DR · 隐身家

#### DRNY — 透明人 · GHOST

> 我的存在感和我的安全感一样低

```
A quiet muted person in a plain grey hoodie standing in a slightly hunched posture,
the figure rendered with 20 percent extra translucency as if fading at the edges,
eyes downcast, clutching a phone close to the chest showing an unsent message draft,
soft thin outline only, very restrained palette
```

#### DRNF — 树懒 · SLOW

> 恋爱这件事急不来的……大概……三年后见？

```
A sleepy slow-motion person in an oversized soft green cardigan, hugging a sloth
plushie against their chest, mid-yawn with heavy eyelids, a single leaf tangled in
their hair, a large wall clock in the background showing barely moving hands, soft
dreamy atmosphere
```

#### DRLY — 仙人掌 · DRY

> 三年浇一次水就够了

```
A stoic person in earth-toned desert wear (canvas jacket, linen shirt), cradling a
small potted cactus against their chest like a beloved pet, one raised skeptical
eyebrow, faint prickly aura lines radiating from their shoulders, dry sun-bleached
background
```

#### DRLF — 已读不回 · SEEN

> 看到了。然后呢？

```
An apathetic person slouching in a grey oversized hoodie, wearing large noise-
cancelling over-ear headphones, holding a phone loosely with a visible "Read"
indicator and a double-checkmark on screen, completely blank unbothered expression,
gaze drifting past the camera, hands-in-pocket energy
```

---

### ⚖️ Hidden · 隐藏人格

#### ALL — 我全都要 · ALL

> 小孩子才做选择，而我全都要——然后一个也没得到

```
A wide-grinning greedy young person comically overloaded with every possible
romance archetype at once, arms stretched wide trying to cradle a chaotic
pile of mismatched props — a tiny megaphone, a chess piece, a lit sparkler,
a cactus, a bouquet, a leash, a rose, a phone — all slipping through their
fingers and tumbling to the floor, a crooked golden paper crown reading
"ALL" perched on messy hair, sparkling eyes full of insatiable want, empty
hands at the center of the composition despite the overflowing pile
```

> Family color cue 替换为：`, background radiating four faint color wedges (violet, mustard, dusty blue, sage green) from a hollow slate grey center #6b7280`

---

### 🎭 Hidden+ · 隐藏彩蛋人格

> 此七型触发条件详见 `DRAFT.md` 第五节「隐藏人格判定顺序」。每型有独立背景配色，直接替换 base prompt 尾的 family color cue 使用。

#### RAT — 鼠鼠恋人 · RAT

> 鼠鼠我啊，连点赞都不敢按下去

```
A small hunched figure in an oversized drab grey hoodie pulled low, a knit
beanie casting a faint rat-ear shadow, crouched close to the ground near a
metal drain grate, hands shielding a phone with an unsent message draft, a
tiny cartoon rat plushie peeking out of the hoodie pocket, downcast self-
pitying eyes, sunken shoulders, dim alley lighting
```

> Family color cue 替换为：`, background tinted damp concrete grey #4a4a4a with faint drain pipe silhouettes`

#### PURE — 纯爱战士 · PURE

> 只要真爱还在，废就废得值得

```
A resolute young person in a modern white knight-inspired long coat with
silver trim, kneeling on one knee while holding aloft a glowing paper heart
like a sacred lantern, eyes wet with idealistic conviction, chin lifted
toward an unseen light source, a single red rose pinned to their chest, a
faint golden halo arcing behind the head, soft rose petals drifting upward
```

> Family color cue 替换为：`, background tinted warm ivory #f5ebd0 with a soft golden halo glow`

#### MAD — 发疯文学家 · MAD

> 我真的要疯了，不是比喻

```
A dishevelled person with wild frizzy hair and visible eye-bags, wearing a
crumpled oversized shirt covered in scribbled text fragments, one hand
aggressively thumb-typing on a phone held mid-air, the other gripping a
coffee cup overflowing dramatically, mouth open mid-rant, one eye twitching,
a snowstorm of loose manuscript pages circling them, a faint electric spark
aura crackling around the shoulders
```

> Family color cue 替换为：`, background tinted fevered crimson #c73e3e with torn paper scraps swirling`

#### E-DOG — 赛博舔狗 · E-DOG

> 现实里不认识你，线上我是你亲爹

```
A hunched person sitting cross-legged on a dim bedroom floor, face dully
lit only by phone glow, wearing a cyberpunk hoodie with glowing LED trim,
cartoon dog-ear outlines hovering above the head like a projected AR filter,
a holographic tongue-out dog emoji floating beside their cheek, the phone
showing chat bubbles stuffed with dog emojis, their real expression flat
and exhausted while the screen reflection beams with affection
```

> Family color cue 替换为：`, background split: deep midnight navy #1e2344 on the left, soft pink screen glow #e8a5c8 on the right`

#### CHAOS — 已读乱回 · CHAOS

> 已读。然后我回了一堆颠话

```
A dazed person with tousled hair in a soft sweater worn backward, clutching
a phone showing nonsense emoji-spam chat bubbles, one eye drooping while
the other is wide open, a bewildered half-smile, random floating objects
drifting around them — a lone banana, a broken umbrella, a single sock —
a large "??" thought bubble above the head, slight glitch artifacts
rippling through the air, feet subtly misaligned
```

> Family color cue 替换为：`, background tinted glitchy lavender #b7a4d1 with soft static noise artifacts`

#### CPU — CPU 恋人 · CPU

> 你一句话能让我 CPU 三天三夜

```
A wide-eyed person with faint smoke trails rising from both ears, a
transparent forehead revealing a glowing red-hot CPU chip with pulsing
circuit traces, both hands gripping their hair in mental overload, a
dropped phone in front of them showing a single unread message, a swirling
whirlwind of tiny text fragments like "did they mean" and "or maybe"
orbiting their head, pupils shaped like loading spinners
```

> Family color cue 替换为：`, background tinted overheated amber #e07a2b with faint circuit trace patterns`

#### BENCH — 备胎之王 · BENCH

> 在鱼塘边上坐成雕像

```
A well-dressed but slightly wilted person sitting patiently on a plain
wooden bench, cardigan over a neat shirt, a faded paper name tag pinned
to their chest reading "SPARE", holding a phone with a long scrolling
"在吗" message thread unanswered, a polite patient smile tinged with
resignation, dust motes suggesting long stillness, a tiny cobweb beginning
to form between their shoulder and the bench, hands folded quietly on
their knees
```

> Family color cue 替换为：`, background tinted dusty beige #cbb89a with a faint wooden bench silhouette`
