# GenePath 录制稿（照着念就行）

**总长约 4 分钟。** 每块先看【画面】做动作，再念【念】里的英文。灰字是提示，不要念出来。

---

## 录制前（30 秒搞定）

1. 浏览器打开 https://candicewu0515.github.io/genepath/
2. **按 `Cmd + Shift + R` 强制刷新**（不刷可能是旧版页面，数字会对不上）
3. 窗口拉到接近全屏的宽度 —— 窄窗口会变单栏布局，图表会被压扁
4. QuickTime → 文件 → 新建屏幕录制 → 录制所选部分（框住浏览器窗口）

---

## ① 开场 · 0:00–0:30

【画面】停在页面最顶部，不要动。让画面停 2 秒再开口。

【念】
> Millions of people now have a pharmacogenomic test result.
> The report says something like "CYP2C19 star-two, star-two."
> Most people can't tell whether that matters for a medicine they already take, or what to do next.
> GenePath turns that one report into two real decisions: is my medication affected, and is there a clinical trial that fits me.
> It covers sixteen medicines across eight genes, and every clinical sentence on this page comes straight from a public API.

---

## ② 用药基因卡 · 0:30–1:10

【画面】点开 **Medication** 下拉框，停 2 秒让评委看到七个分类，然后选 **Clopidogrel · CYP2C19**。
右边 **CYP2C19 result on your report** 选 **`*2/*2 — Poor Metabolizer`**。

【念】
> The list covers blood thinners, statins, acid-reflux drugs, antidepressants, painkillers, chemotherapy and immune suppressants.
> Start with clopidogrel, one of the most prescribed blood thinners.
> It only works after a liver enzyme, CYP2C19, switches it on.

【画面】鼠标划过卡片左半边 **What your result means**，再划到右半边 **What the guideline says**。

【念】
> For a poor metabolizer, the left side explains in plain words that the drug may protect much less well.
> The right side quotes the CPIC guideline word for word: avoid clopidogrel if possible, use prasugrel or ticagrelor.
> This is information for a conversation with a doctor, not an instruction.

---

## ③ 祖源频率图 · 1:10–1:55

【画面】往下滚到 **How common is this variant around the world?** 鼠标指东亚和南亚那两根柱子，再指下面绿色那行提示。

【念】
> This chart uses real aggregate data from the All of Us Research Program — about five hundred and thirty-five thousand participants.
> The star-two variant sits on about thirty-one percent of gene copies in East Asian participants, and thirty-four percent in South Asian participants.
> That is more than three times the rate in Middle Eastern participants.

【画面】Medication 切到 **Warfarin · VKORC1**，把 **VKORC1 −1639 result** 选成 **`A/A — most sensitive`**。
图表会自动显示 VKORC1，鼠标指东亚那根柱子。

【念】
> Warfarin shows the gap even more clearly.
> Eighty-seven percent in East Asian ancestry, against nine percent in African ancestry.
> The same starting dose cannot be right for everyone.

【画面】Medication 切到 **Azathioprine · NUDT15**（下拉里有两个 Azathioprine，选后面标 NUDT15 的那个），基因型选 **`*3/*3 — Poor Metabolizer`**。

【念】
> And the gap is not always the one people expect.
> NUDT15 star-three makes a standard dose of this immune drug dangerous.
> It sits at about ten percent in East Asian participants, and almost none in African or European participants —
> exactly the kind of variant a test panel designed around one population leaves out.

---

## ④ 带去看医生 · 1:55–2:10

【画面】滚到卡片底部 **Questions to take to your next appointment**，点 **Print this card**，打印预览弹出后停 2 秒，按 Esc 取消。

【念】
> The card ends with questions to bring to an appointment, and it prints on one page.

---

## ⑤ 临床试验导航 · 2:10–3:20

【画面】Medication **切回 Clopidogrel**，滚到卡片下方，点蓝字按钮 **See recruiting Atrial fibrillation trials →**。
页面会自动滚到第二部分并开始查询，等结果出来。

【念】
> The second question: is anyone studying better options for people like me?
> Each drug hands off to the condition it is used for — clopidogrel to atrial fibrillation.
> This is a live query to ClinicalTrials.gov, filtered to studies open to a sixty-eight-year-old, and sorted by distance.
> If nothing is recruiting nearby, the search widens itself and says so.

【画面】第一条试验下面已经展开 **Key entry rules, in plain words**。鼠标沿着三条规则慢慢往下划 —— 每条上面是原文，下面绿色方块是人话解释。

【念】
> Each study shows its three key entry rules in the original wording,
> with a plain-language note under each one, the nearest sites, and who to contact.

【画面】勾上 **Use saved sample data (works offline)**，列表会立刻换成本地快照。

【念】
> And if the network is down, a saved snapshot keeps the whole thing working.

---

## ⑥ 数据来源与收尾 · 3:20–4:00

【画面】滚到页面最底部的 **Data sources** 和 **Limits** 两段，鼠标跟着念到的内容走。

【念】
> Everything here is real, public data.
> The All of Us Data Browser for frequencies, the CPIC API for the recommendations, ClinicalTrials.gov for trials.
> A build script pulls all of it and fails if any value cannot be confirmed, so no guideline text is typed by hand.
> The page stores nothing, and makes no AI calls at run time, so nothing a user enters ever reaches a model.
> It is an educational demo: frequencies describe populations, not individuals, and only a study team can confirm eligibility.
> Next, we want to read a real report file, and add CYP2D6.
> Thank you.

---

## 念错了怎么办

别停、别重录。停 2 秒，把那一句重念一遍就行 —— 后期把前一次剪掉。
