# FWTI 十六型人格画像 — AI 生图 Prompt Kit

## 2. 共用 Base Prompt（一贯到底，十六型皆用）

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

## 4. 技术参数

| 平台             | 建议参数                                                     |
| ---------------- | ------------------------------------------------------------ |
| Midjourney v6.1+ | `--ar 1:1 --style raw --stylize 250 --v 6.1`                 |
| DALL·E 3         | aspect `1:1`, 尺寸 `1024×1024`，前加 `Create a stylized flat vector illustration...` |
| SDXL             | steps 35, CFG 6, sampler DPM++ 2M Karras；若有 16p-style LoRA 更佳 |

### 一致性关键（极重要）

1. **用风格参考图**：下载一张官方 16p SVG 转 PNG（如 intj-architect-male），Midjourney 加 `--sref <url>`，DALL·E 以 "in the same illustration style as this reference" 附图。十六张全程用**同一张**参考图。
2. **同一 base prompt**：只替换 subject 段，其余字面不变。
3. **固定风格权重**：MJ `--sw 100–200`；SDXL 用 ControlNet reference-only。
4. **分两轮**：先生四家族各一张（GZNY/GRNY/DZNY/DRNY）校准风格；定调后再批量生剩下十二张。

---

## 5. 十六型 Subject Prompts

> 格式：每型列出「subject 段」，直接插入 base prompt **前端**使用，形如：
>
> ```
> <Subject>. <Base prompt> <Family color cue>.
> ```

### 家族底色线索（Family color cue）

| Family    | 家族名          | cue 字段（接 base prompt 尾）                                         |
| --------- | --------------- | --------------------------------------------------------------------- |
| **GZ**    | 激进家（冲·炸） | `, background tinted soft violet #88619a`                             |
| **GR**    | 隐忍家（冲·忍） | `, background tinted warm mustard #e4ae3a`                            |
| **DZ**    | 内爆家（蹲·炸） | `, background tinted dusty blue #4298b4`                              |
| **DR**    | 隐身家（蹲·忍） | `, background tinted sage green #33a474`                              |
| **LIMBO** | 骑墙家（隐藏）  | `, background tinted split neutral slate #6b7280` — 用左右对称分割构图 |

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

### ⚖️ Hidden · 骑墙家

#### LIMBO — 骑墙党 · LIMBO

> 每个维度都恰好一半，测完反而更迷茫

```
An indecisive ambiguous person in neutral grey-toned clothing (half cool, half warm),
standing balanced on top of a narrow wall or fence that runs directly through the
center of the composition, holding their arms out for balance, head turned halfway
between two directions as if unable to commit, expression pleasantly uncertain with
a slight shrug, four small floating question marks orbiting around their head in a
perfect symmetric pattern, background split subtly into two mirrored halves
```

> Family color cue 替换为：`, background tinted split neutral slate #6b7280 with a soft dividing line through the middle`

---
