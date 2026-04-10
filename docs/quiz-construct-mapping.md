# Quiz Construct Mapping

## Scope

This document defines the construct model behind the v0.4 quiz engine. Its purpose is not to claim psychometric validation. Its purpose is to ensure that every reachable quiz path is interpreted through one internally coherent framework.

## Decision Stack

```text
┌──────────────┐
│ META status  │
└──────┬───────┘
       ▼
┌──────────────┐
│ Current path │
│ trunk + ext  │
│ + follow-up  │
└──────┬───────┘
       ▼
┌──────────────┐
│ 4 ratios     │
│ GD ZR NL YF  │
└──────┬───────┘
       ▼
◆ Hidden override? ◆
├── Yes  ───> hidden personality
└── No
    ▼
◆ >= 2 ties? ◆
├── Yes  ───> ALL
└── No   ───> 16-grid code
```

## Dimension Model

| Dimension | Positive pole | Negative pole | Theory anchor | Interpretation rule |
|---|---|---|---|---|
| `GD` | `G` = approach / initiative | `D` = inhibition / passivity | BIS/BAS; approach-avoidance motivation | Measures whether the person moves toward relational contact or waits, withdraws, or freezes. |
| `ZR` | `Z` = externalized expression | `R` = suppression / inhibition | emotion regulation | Measures whether affect is discharged outwardly or held inward. |
| `NL` | `N` = closeness seeking | `L` = distance seeking | adult attachment avoidance | Measures desired relational proximity, not simple sociability. |
| `YF` | `Y` = anxious vigilance | `F` = calm trust / low vigilance | adult attachment anxiety | Measures threat monitoring, jealousy, and fear of abandonment. |

## Item-Level Interpretation Rule

| Rule | Meaning |
|---|---|
| Current-path only | A question contributes only if it is reachable on the active path. |
| Ratio scoring | Each answered option contributes `score / 2`, then the dimension is averaged over answered items on that path. |
| Follow-up refinement | Follow-ups sharpen local interpretation; they do not create a new top-level construct. |
| Secondary contribution | A follow-up may contribute to a second dimension only when the option text clearly expresses a second construct. |
| Easter-egg isolation | `Q31`, `Q33`, `Q34`, `Q35` do not affect the four ratios. They are overlay evidence only. |

## Status Paths

| Status | Construct purpose | Interpretation constraint |
|---|---|---|
| `dating` | Maintenance of an active bond | Use scenarios that presume mutual access and repeated interaction. |
| `ambiguous` | Uncertainty under partial reciprocity | This is the only path where certain “mixed-signal” constructs are observable enough for `CPU` and `BENCH`. |
| `crush` | One-sided or unresolved attachment investment | High `YF` here reflects fantasy, rumination, and unresolved emotional investment rather than dyadic conflict. |
| `solo` | Low-current-contact attachment stance | Allows separation between low approach, low closeness desire, and anxious self-withdrawal. |

## Hidden Personality Guardrails

| Hidden code | Construct reading | Guardrail |
|---|---|---|
| `MAD` | globally extreme hyperactivation | Must be narrower than any ordinary 16-grid result. |
| `RAT` | avoidant withdrawal plus anxious insecurity | Must remain `D + R + L + Y`; otherwise the label contradicts its own narrative. |
| `PURE` | high initiative and investment with low suspicion | Should remain unavailable to clearly defensive or cynical profiles. |
| `CPU` | ambiguity-specific mental over-interpretation | Requires ambiguity-path evidence, not generic high `YF`. |
| `CHAOS` | inconsistent emotional replying under a surface of distance or calmness | Confined to `ZR` variance to keep the label tied to expressive incoherence rather than general indecision. |
| `E-DOG` | asymmetry between digital initiative and attachment intensity | Requires active contact behaviors with near-balanced `NL`, not high clinginess. |
| `BENCH` | controlled exterior with hidden anxious waiting | Must retain positive `YF`; otherwise it collapses into simple detachment. |
| `VOID` | low approach and low closeness with relief in disconnection | Requires explicit offline-relief evidence. |
| `LIMBO` | unresolved longing plus surveillance-like checking | Requires `crush` path and jealousy/checking evidence. |
| `ALL` | multi-dimension exact tie fallback | This is a classification fallback, not a standalone construct scale. |

## Scientific Boundary

| Layer | Claim strength |
|---|---|
| Four continuous dimensions | Theory-anchored and defensible as a humorous adaptation of established constructs. |
| 16-grid labels | Entertainment-oriented discretization of continuous dimensions. |
| Hidden personalities and titles | Narrative overlays inspired by theory; not standard psychological categories. |

## Literature Anchors

| Construct area | Primary references |
|---|---|
| adult attachment anxiety / avoidance | Brennan, Clark, & Shaver (1998); Fraley, Waller, & Brennan (2000); Shaver & Mikulincer (2006) |
| emotion expression / suppression | Gross & John (2003) |
| approach / avoidance motivation | Carver & White (1994); Gable (2006) |

## Non-Claims

| This quiz does | This quiz does not |
|---|---|
| borrow construct structure and item inspiration from relationship science | function as a validated scale |
| preserve a single interpretation framework across paths | diagnose attachment style or personality disorder |
| use hidden labels as overlays on top of the same four-dimensional space | justify real-world decisions about partners or oneself |
