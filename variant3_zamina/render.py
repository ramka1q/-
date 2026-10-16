import sys, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["mathtext.fontset"] = "cm"
OUT = sys.argv[1]
INK = "#1a2a8a"

def render(name, lines, width=11):
    H = {"h": 0.6, "t": 0.6, "m": 1.15, "s": 0.55, "a": 1.0, "M": 2.0}
    total = sum(H[k] for k, _ in lines) + 0.3
    fig = plt.figure(figsize=(width, total))
    y = total - 0.2
    for k, s in lines:
        y -= H[k] / 2
        size = {"h": 18, "t": 14, "m": 19, "s": 17, "a": 19, "M": 19}[k]
        color = "#b00000" if k in ("h", "a") else ("#333" if k == "t" else INK)
        fig.text(0.3 / width, y / total, s, fontsize=size, color=color, va="center", ha="left",
                 weight="bold" if k == "h" else "normal")
        y -= H[k] / 2
    fig.savefig(f"{OUT}/{name}", dpi=130, facecolor="white"); plt.close(fig)



render("1.png", [
    ("h", "1)"),
    ("t", "Усі числа — степені тройки:"),
    ("s", r"$81^{-1{,}25}\cdot 9^{1{,}5}\cdot 27^{2/3}=3^{4\cdot(-1{,}25)}\cdot 3^{2\cdot 1{,}5}\cdot 3^{3\cdot\frac{2}{3}}=3^{-5}\cdot 3^{3}\cdot 3^{2}=3^{0}=1$"),
    ("a", "Відповідь:  1"),
], width=12)

render("2.png", [
    ("h", "2)"),
    ("s", r"Заміна:  $t=m^{1/10}$,  тоді  $m^{1/5}=t^2$"),
    ("m", r"$\left(\dfrac{3t}{t+5}-\dfrac{8t}{t^2+10t+25}\right):\dfrac{3t+7}{t^2-25}+\dfrac{5t-25}{t+5}$"),
    ("t", "1) Дужка:"),
    ("m", r"$\dfrac{3t}{t+5}-\dfrac{8t}{(t+5)^2}=\dfrac{3t(t+5)-8t}{(t+5)^2}=\dfrac{3t^2+7t}{(t+5)^2}=\dfrac{t(3t+7)}{(t+5)^2}$"),
    ("t", "2) Ділення:"),
    ("m", r"$\dfrac{t(3t+7)}{(t+5)^2}\cdot\dfrac{(t-5)(t+5)}{3t+7}=\dfrac{t(t-5)}{t+5}$"),
    ("t", "3) Додавання:"),
    ("m", r"$\dfrac{t(t-5)}{t+5}+\dfrac{5(t-5)}{t+5}=\dfrac{(t-5)(t+5)}{t+5}=t-5$"),
    ("s", r"Повертаємось до $m$:   $t-5=m^{1/10}-5$"),
    ("a", r"Відповідь:  $m^{1/10}-5$"),
], width=12)

render("3.png", [
    ("h", "3)"),
    ("s", r"Заміна:  $t=\sqrt{x}$,  тоді  $x=t^2$,  $x^2=t^4$"),
    ("m", r"$\dfrac{t+1}{1+t+t^2}:\dfrac{1}{t^4-t}=\dfrac{t+1}{t^2+t+1}\cdot(t^4-t)$"),
    ("s", r"$t^4-t=t(t^3-1)=t(t-1)(t^2+t+1)$     (різниця кубів)"),
    ("m", r"$\dfrac{(t+1)\cdot t(t-1)(t^2+t+1)}{t^2+t+1}=t(t+1)(t-1)=t(t^2-1)$"),
    ("s", r"Повертаємось до $x$:   $t(t^2-1)=\sqrt{x}\,(x-1)$"),
    ("a", r"Відповідь:  $\sqrt{x}\,(x-1)$"),
], width=12)

render("4.png", [
    ("h", "4)"),
    ("s", r"Заміна:  $t=a^{1/4}$"),
    ("s", r"$t(t-2)-(t+2)^2=t^2-2t-(t^2+4t+4)=t^2-2t-t^2-4t-4=-6t-4$"),
    ("s", r"Повертаємось до $a$:   $-6t-4=-6a^{1/4}-4$"),
    ("a", r"Відповідь:  $-6a^{1/4}-4$"),
], width=12)
