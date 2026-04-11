# FWTI 十六型人格画像 — AI 生图 Prompt Kit

> 目的：以 Midjourney / DALL·E 3 / SDXL 生成与 16personalities 官方画像**同一视觉语系**之十六型人物插画，再经 potrace 转描为 SVG，置入 `src/assets/fwti/`。

---

## 1. 官方风格解剖（prompt 须复现之特征）

读 `src/assets/16p/*.svg` 可得：

- **媒介**：flat vector illustration, 多边形切面着色（faceted polygon shading），无描边
- **光影**：每一材质分 highlight / midtone / shadow 三阶，软侧光
- **人物**：单人，3/4 body 或全身，站立/坐姿自然，比例略风格化（头身比约 1:6）
- **色板**：muted / desaturated，每家族有一主色渗入背景
- **构图**：1:1 方图，人物占画面约 70%，底部含地面投影，上下留白
- **道具**：1–2 件，紧贴人格主题
- **背景**：淡渐变 + 微弱环境元素（藤、书、光斑），不喧宾夺主

---

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

| 平台 | 建议参数 |
|---|---|
| Midjourney v6.1+ | `--ar 1:1 --style raw --stylize 250 --v 6.1` |
| DALL·E 3 | aspect `1:1`, 尺寸 `1024×1024`，前加 `Create a stylized flat vector illustration...` |
| SDXL | steps 35, CFG 6, sampler DPM++ 2M Karras；若有 16p-style LoRA 更佳 |

### 一致性关键（极重要）

1. **用风格参考图**：下载一张官方 16p SVG 转 PNG（如 intj-architect-male），Midjourney 加 `--sref <url>`，DALL·E 以 "in the same illustration style as this reference" 附图。十六张全程用**同一张**参考图。
2. **同一 base prompt**：只替换 subject 段，其余字面不变。
3. **固定风格权重**：MJ `--sw 100–200`；SDXL 用 ControlNet reference-only。
4. **分两轮**：先生四家族各一张（GZNY/GRNY/DZNY/DRNY）校准风格；定调后再批量生剩下十二张。

---

## 5. 十六型 Subject Prompts

> 格式：每型列出「subject 段」，直接插入 base prompt **前端**使用，形如：
> ```
> <Subject>. <Base prompt> <Family color cue>.
> ```

### 家族底色线索（Family color cue）

| Family | 家族名 | cue 字段（接 base prompt 尾） |
|---|---|---|
| **GZ** | 激进家（冲·炸） | `, background tinted soft violet #88619a` |
| **GR** | 隐忍家（冲·忍） | `, background tinted warm mustard #e4ae3a` |
| **DZ** | 内爆家（蹲·炸） | `, background tinted dusty blue #4298b4` |
| **DR** | 隐身家（蹲·忍） | `, background tinted sage green #33a474` |

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

#### GZNF — 恋爱脑 · SIMP
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

#### GZLF — 浪子 · YOLO
> 爱得热烈，走得潇洒

```
A confident free-spirited person in a leather jacket over a graphic tee, balancing
one foot on a skateboard, windswept hair, wide carefree grin, giving a two-finger
salute goodbye, a trail of tiny faded hearts drifting behind them like exhaust
```

---

### 🟡 GR · 隐忍家

#### GRNY — 卑微战士 · SOIL
> 把自己低到尘埃里，还觉得尘埃嫌弃我

```
A humble young person in earthy brown workwear kneeling on one knee, offering up a
tray with coffee and a small wrapped gift like a tribute, shoulders hunched forward,
anxious apologetic half-smile, a single bead of sweat on the forehead, fine dust
particles drifting around their knees
```

#### GRNF — 舔狗 · WOOF
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
> 你为什么来做这个测试？

```
A well-adjusted balanced person in neat casual clothes (cardigan over shirt),
relaxed standing pose, holding a coffee cup in one hand and an open paperback in
the other, warm genuine unforced smile, no drama props, clean minimal background,
serene and composed
```

---

### 🔵 DZ · 内爆家

#### DZNY — 定时炸弹 · FUZE
> 表面风平浪静，内心已经核爆三次了

```
A quiet polite person in a neat button-up shirt sitting stiffly on a wooden stool,
strained thin-lipped smile, hands folded tightly in their lap, a subtle cartoon bomb
with a visible countdown timer peeking from inside the shirt collar, faint red
anger marks floating above the head, eye twitching slightly
```

#### DZNF — 林黛玉 · TEAR
> 风吹一下我就能哭半小时

```
A delicate melancholic person in layered soft-hued hanfu-inspired top, seated among
falling cherry blossom petals, tears streaming down both cheeks, clutching a small
embroidered handkerchief to their mouth, head tilted downward in sorrow, long hair
gently wind-blown
```

#### DZLY — 刺猬 · OUCH
> 别靠近我！……你怎么走了？

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

#### DRNY — 透明人 · VOID
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

#### DRLF — 已读不回 · GONE
> 恋爱？那是能吃的东西吗？

```
An apathetic person slouching in a grey oversized hoodie, wearing large noise-
cancelling over-ear headphones, holding a phone loosely with a visible "Read"
indicator and a double-checkmark on screen, completely blank unbothered expression,
gaze drifting past the camera, hands-in-pocket energy
```

---

## 6. 生图后处理流程（PNG → SVG）

```bash
# 1. 从 AI 平台下载 PNG (≥1024×1024)
# 2. 色阶压缩（posterize 至 ~16 色，便 potrace）
magick input.png -posterize 8 -blur 0x1 posterized.png

# 3. 每色分层 trace（关键步骤，保多边形感）
#    脚本：对每一主色，阈值化为黑白 → potrace → 合并
#    或用 vtracer（更佳，自带多色 trace）:
cargo install vtracer
vtracer --input posterized.png --output output.svg \
        --mode polygon --filter_speckle 4 --color_precision 6 \
        --layer_difference 16 --corner_threshold 60 --segment_length 4

# 4. 清理 SVG（SVGO）
npx svgo output.svg -o src/assets/fwti/gzny-boom.svg \
    --config='{"plugins":["preset-default",{"name":"removeViewBox","active":false}]}'

# 5. 手工微调：viewBox 归一至 0 0 400 400，对齐人物居中
```

**推荐工具**：[vtracer](https://github.com/visioncortex/vtracer) > potrace。vtracer 直接吐出彩色多边形 SVG，与 16p 官方多边形风格最契。

---

## 7. 文件命名约定

```
src/assets/fwti/
├── gzny-boom.svg
├── gznf-simp.svg
├── gzly-sour.svg
├── gzlf-yolo.svg
├── grny-soil.svg
├── grnf-woof.svg
├── grly-bait.svg
├── grlf-sane.svg
├── dzny-tick.svg
├── dznf-tear.svg
├── dzly-ouch.svg
├── dzlf-meow.svg
├── drny-void.svg
├── drnf-slow.svg
├── drly-dry.svg
└── drlf-seen.svg
```

---

## 8. 核验清单（每张生成后对照）

- [ ] 构图 1:1，人物居中占约 70%
- [ ] 背景渐变颜色匹配家族 cue
- [ ] 多边形面化着色明显（非平涂、非渐变柔化）
- [ ] 无粗描边、无 anime 感
- [ ] 道具清晰可辨、契合人格
- [ ] 表情 / 姿态能立刻读出人格关键词
- [ ] 与其余十五张风格一致（并排看不违和）

---

*v0.1 · 若初稿风格不对位，调整 Base Prompt 第 3-5 行字眼，而非 Subject 段。*
