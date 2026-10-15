import sys, numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
OUT = sys.argv[1]
INK = "#1f3fbf"; GRAY = "#8a8a8a"

def axes(ax, xr, yr, title):
    ax.set_xlim(*xr); ax.set_ylim(*yr); ax.set_aspect("equal")
    ax.set_xticks(np.arange(np.ceil(xr[0]), xr[1] + 1e-9, 1))
    ax.set_yticks(np.arange(np.ceil(yr[0]), yr[1] + 1e-9, 1))
    ax.grid(True, color="#b9d3ee", lw=0.7)
    for s in ax.spines.values(): s.set_visible(False)
    ax.tick_params(length=0, labelbottom=False, labelleft=False)
    for i in range(int(np.ceil(xr[0])), int(np.floor(xr[1] - 0.5)) + 1):
        if i: ax.text(i, -0.15, str(i).replace("-", "−"), ha="center", va="top", fontsize=8, color="#333")
    for j in range(int(np.ceil(yr[0])), int(np.floor(yr[1] - 0.5)) + 1):
        if j: ax.text(-0.12, j, str(j).replace("-", "−"), ha="right", va="center", fontsize=8, color="#333")
    ax.annotate("", xy=(xr[1], 0), xytext=(xr[0], 0), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax.annotate("", xy=(0, yr[1]), xytext=(0, yr[0]), arrowprops=dict(arrowstyle="->", lw=1.2))
    ax.text(xr[1] - 0.3, -0.7, "x", fontsize=12, style="italic")
    ax.text(0.25, yr[1] - 0.6, "y", fontsize=12, style="italic")
    ax.text(-0.12, -0.15, "0", ha="right", va="top", fontsize=9)
    ax.set_title(title, fontsize=12, loc="left")

def pts(ax, P):
    for x, y, lab, *off in P:
        ax.plot(x, y, "o", color="#d62828", ms=4, zorder=5)
        if lab: ax.annotate(lab, (x, y), textcoords="offset points", xytext=off[0] if off else (5, 5), fontsize=8, color="#b00000")

def curve(ax, x, y, **kw):
    kw.setdefault("color", INK); kw.setdefault("lw", 2)
    ax.plot(x, y, **kw)

def save(fig, name):
    fig.tight_layout(); fig.savefig(f"{OUT}/{name}", dpi=150); plt.close(fig)

# 1) y = 2/5 x - 3
fig, ax = plt.subplots(figsize=(6, 5))
axes(ax, (-6, 9), (-6, 3), "1)  y = (2/5)x − 3")
x = np.linspace(-6, 9, 100); curve(ax, x, 0.4 * x - 3, label="y = (2/5)x − 3")
pts(ax, [(0, -3, "(0; −3)"), (5, -1, "(5; −1)"), (-5, -5, "(−5; −5)"), (7.5, 0, "(7,5; 0)")])
ax.legend(loc="upper left", fontsize=9); save(fig, "1.png")

# 2) y = -2x^2 + x - 3  (through the vertex)
fig, ax = plt.subplots(figsize=(6, 6.5))
axes(ax, (-3, 3.5), (-8, 2), "2)  y = −2x² + x − 3")
x = np.linspace(-3, 3.5, 400); curve(ax, x, -2 * x**2 + x - 3)
ax.axvline(0.25, color="#d62828", lw=0.8, ls="--"); ax.text(0.32, -7.7, "x = 0,25", color="#d62828", fontsize=9)
pts(ax, [(0.25, -2.875, "вершина (0,25; −2,875)"), (0, -3, "", ), (0.5, -3, ""), (1, -4, "(1; −4)"), (-0.5, -4, "(−0,5; −4)", (-62, 4)),
         (1.5, -6, "(1,5; −6)"), (-1, -6, "(−1; −6)", (-50, 4))])
save(fig, "2.png")

# 3) y = 3 - 4/(x+5)
fig, (a, b) = plt.subplots(1, 2, figsize=(10, 5.5))
axes(a, (-6, 6), (-6, 6), "а)  y = −4/x")
for xs in (np.linspace(-6, -0.67, 300), np.linspace(0.67, 6, 300)): curve(a, xs, -4 / xs)
pts(a, [(1, -4, "(1; −4)"), (2, -2, "(2; −2)"), (4, -1, "(4; −1)"), (-1, 4, "(−1; 4)"), (-2, 2, "(−2; 2)"), (-4, 1, "(−4; 1)")])
axes(b, (-12, 3), (-4, 10), "б)  y = 3 − 4/(x + 5)")
b.axvline(-5, color="#d62828", lw=1, ls="--"); b.axhline(3, color="#d62828", lw=1, ls="--")
b.text(-4.8, 9.2, "x = −5", color="#d62828", fontsize=9); b.text(1.0, 3.3, "y = 3", color="#d62828", fontsize=9)
for xs in (np.linspace(-12, -5.6, 300), np.linspace(-4.6, 3, 300)): curve(b, xs, 3 - 4 / (xs + 5))
pts(b, [(-4, -1, "(−4; −1)"), (-3, 1, "(−3; 1)"), (-1, 2, "(−1; 2)"), (0, 2.2, "(0; 2,2)"), (-11/3, 0, "(−3⅔; 0)"),
        (-6, 7, "(−6; 7)"), (-7, 5, "(−7; 5)"), (-9, 4, "(−9; 4)")])
save(fig, "3.png")

# 4) y = -5/3 |3x - 2| + 2 = -5|x - 2/3| + 2
fig, (a, b) = plt.subplots(1, 2, figsize=(10, 5.5))
xr, yr = (-2, 3), (-6, 3)
x = np.linspace(-2, 3, 401)
axes(a, xr, yr, "а)  y = −5|x|"); curve(a, x, -5 * abs(x))
pts(a, [(0, 0, "(0; 0)"), (1, -5, "(1; −5)"), (-1, -5, "(−1; −5)")])
axes(b, xr, yr, "б)  y = −5/3·|3x − 2| + 2 = −5|x − ⅔| + 2")
curve(b, x, -5 * abs(x), color=GRAY, lw=1, ls="--", label="y = −5|x|")
curve(b, x, -5 * abs(x - 2/3) + 2, label="y = −5|x − ⅔| + 2")
pts(b, [(2/3, 2, "вершина (⅔; 2)"), (0, -4/3, "(0; −1⅓)"), (4/15, 0, ""), (16/15, 0, ""),
        (4/3, -4/3, "(1⅓; −1⅓)"), (5/3, -3, "(1⅔; −3)"), (-1/3, -3, "(−⅓; −3)")])
b.legend(loc="lower left", fontsize=8); save(fig, "4.png")

# 5) y = -x^2 + |x| - 4  (two vertices)
fig, ax = plt.subplots(figsize=(6, 7))
axes(ax, (-4, 4), (-11, 2), "5)  y = −x² + |x| − 4")
xx = np.linspace(-3.4, 3.4, 600); curve(ax, xx, -xx**2 + abs(xx) - 4)
pts(ax, [(0, -4, "(0; −4)", (-16, -16)), (0.5, -3.75, "(0,5; −3,75)", (4, 10)), (-0.5, -3.75, "(−0,5; −3,75)", (-70, 10)),
         (1, -4, ""), (-1, -4, ""), (2, -6, "(2; −6)"), (-2, -6, "(−2; −6)", (-48, 4)), (3, -10, "(3; −10)"), (-3, -10, "(−3; −10)", (-58, 4))])
save(fig, "5.png")
