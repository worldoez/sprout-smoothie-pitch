# Analysis takeaways (extracted from output/team_report_by_role.html)

## [global-2] Demand curve: what share of students would still pay at each price
Figures: 03_demand_curve.png
Takeaway: 77% would pay HK$25, 53% HK$30, 40% HK$35. The revenue-maximising price on this curve is HK$25. GLOBAL: EVERYONE READS THIS Method guide: what each chart and test does, and what is in class Use this table to decide what each method can and cannot say. CLASS = taught in Lessons 7-9. BEYOND CLASS = extra method added for small or skewed data; each has a plain explanation. R LAB TOPIC = taught in the R lab sessions (mul

## [r1-0] What students drink and where they buy on campus today: the competition
Figures: 02_shops.png
Takeaway: canteens (78%) and vending machines (60%) are the main competition. In their words: “Mostly taste and price. I'd buy it as an afternoon snack or while studying if the queue is short and it costs about the same as a boba drink, since I already buy those on campus.” (respondent row 47, purchase intent 4/5) · “I’m just not a person who will buy non-coffee / non-matcha drinks intentionally” (respondent row 55, purchase i

## [r1-1] How much they spend today compared with what they would pay for a smoothie
Figures: -
Takeaway: the typical student pays about HK$10 per drink today and says they would pay about HK$30 for a smoothie with one add-on. In their words: “price, volume and amount of sugar” (respondent row 15, purchase intent 5/5) · “Location and I would likely be more pricy than a soda” (respondent row 58, purchase intent 3/5)

## [r2-0] How the survey questions were obtained
Figures: -
Takeaway: exploratory interviews came first (to find ideas), then the survey (to measure them); teammates must confirm which transcript is Caleb's.

## [r2-2] The survey: questions and the categories
Figures: -
Takeaway: 42 questions grouped into 4 proposed categories; teammates must confirm or rename them.

## [r2-3] Lecture theory behind the design
Figures: -
Takeaway: 39 of 48 design choices are matched to the lecture slides; 9 have no clear slide support.

## [r2-4] Survey design and how we filtered out poor-quality responses: form spammers
Figures: -
Takeaway: five filters (screening, incompletes, duplicates, attention check, outlier prices) plus two form-bug fixes; the attention check removed 11 of 64 and does not change the median WTP.

## [r2-5] Who answered the survey: sample profile
Figures: -
Takeaway: 94% undergraduates, so do not generalise to staff or postgraduates.

## [r2-6] Why students would or would not buy, counted from their open-ended answers
Figures: -
Takeaway: the most-cited reasons are taste enjoyment, price value, convenience access; see the full table for what holds people back. In their words: “I would purchase a healthy fruit based drink often if it is convenient and well priced.” (respondent row 3, purchase intent 4/5) · “i don't have smoothies normally but i guess if it were with friends maybe id try?” (respondent row 22, purchase intent 3/5)

## [r2-7] How we cleaned the data: who was removed and which prices were flagged as outliers
Figures: -
Takeaway: of 16 responses removed, 11 failed the attention check; a few extreme prices are blanked in tier C only.

## [r2-8] Do our cleaning choices change the conclusions?: same numbers under tiers A, B and C
Figures: 11_box_prices_three_tiers.png
Takeaway: the median WTP is the same in every tier; only the averages move because of tier A's extreme answers.

## [r2-9] Sample size: how many respondents we have compared with how many we would need
Figures: -
Takeaway: we have 53; a precise percentage (+/-8 points) needs about 151.

## [r2-10] Extra data checks: blanked respondents, the Q9 rule, purchase-intent spread and prices by tier
Figures: -
Takeaway: 5 respondents who never buy drinks had spend answers blanked; the two Q9 scoring rules differ by only 1.7 points in taste share; no one chose a purchase-intent score below 2.

## [r2-11] Open-ended answers: the R keyword first pass compared with the AI coding
Figures: 06_theme_bars.png, 06_theme_by_intent.png, 06_theme_cooccurrence.png
Takeaway: the R keyword pass ranks taste enjoyment, low need habit, price value, variety menu; the AI coding ranks taste enjoyment, price value, convenience access, low need habit. The AI coding reads the answers and is more accurate; neither is final until two people verify.

## [r3-0] Positioning evidence: what matters most when students buy a drink
Figures: 02_importance.png
Takeaway: the ranking is taste > price > healthiness; position on the leaders and treat the rest as reasons to believe. In their words: “highkey i just built an awesome smoothie in my mind and now i must consume it” (respondent row 37, purchase intent 4/5) · “I don't purchase drinks on sudden desire - I try to enjoy my drinks” (respondent row 38, purchase intent 5/5)

## [r3-1] Segmentation: three groups of students who value different things
Figures: -
Takeaway: 3 small segments (segment 1 (12 people) = taste + health; segment 2 (19 people) = taste + freshness; segment 3 (22 people) = taste + price).

## [r3-2] Targeting: which groups are more likely to buy, and which group differences can we actually detect?
Figures: 12_effect_heatmap.png, 12_oncampus_vs_off_prop.png
Takeaway: very few differences are detectable. Green cells are the only real signals, and some of those are fragile across cleaning tiers. In their words: “I mainly go for cheap vending machine drinks, only about 1-2x per week, and will occasionally treat myself to a coffee at cafe330. I consider smoothies more as food than as a drink.” (respondent row 30, purchase intent 4/5) · “I prefer more liquidy and milky drinks, so that

## [r3-3] Would they buy? Stated purchase intent
Figures: -
Takeaway: 70% say probably or definitely (95% range 56%-80%); stated intent overstates real buying.

## [r3-4] Study year, correlations and group extras: deep dive
Figures: 12_correlation_map.png, 12_oncampus_vs_off_numeric.png, 12_price_by_study_year.png
Takeaway: years 3-5 (n = 38) have a median WTP of HK$30 vs HK$21 for years 1-2 (n = 12). Years 1-2 vs 3-5: p = 0.046; trend (Spearman): p = 0.35; year groups (Kruskal): p = 0.12. 1 of 3 tests are below 0.05, the youngest group is small and many tests were run, so treat it as a lead, not a finding.

## [r4-0] Product: which fruits, add-ons, bases and greens students chose
Figures: 04_addons.png, 04_base.png, 04_fruit.png, 04_veg.png
Takeaway: lead with mango and strawberry; add-ons: protein powder 51% and vitamin boost 49% (ranges overlap, so they cannot be ranked); bases: yogurt and fruit juice.

## [r4-1] Size, seasonal items and customisation: how much students agree: cues for packaging and menu
Figures: 02_likert.png
Takeaway: “want cup-size choice” (74% agree) and “interested in seasonal items” (74% agree) have the strongest support.

## [r4-2] Place: where students want the shop and when they would buy
Figures: 04_occasion.png, 04_where.png
Takeaway: YIA Building 47% and Central Campus (CC) teaching buildings 47% are statistically tied (their ranges overlap); the leading occasions are hanging out with friends, dessert or treat, to cool down in hot weather. In their words: “No smoothie option near university library area” (respondent row 60, purchase intent 4/5) · “because sometimes it would be nice to have something refreshing made with natural ingridients. espci

## [r4-4] Greens and customisation: what students said
Figures: -
Takeaway: mint and avocado are the only greens above 45%. In their words: “Depends on protein and caffeine options and being able to customize. I care about macros and sugar, and I would use a pre-order app to skip the queue between classes. Price has to stay reasonable.” (respondent row 67, purchase intent 3/5)

## [r5-0] How to read the pricing tests in plain words: t-tests and what "significant" means
Figures: -
Takeaway: 4 of 15 pricing tests are statistically significant. The clearest is the paired test: the same people say they would pay far more for a smoothie than they usually spend. Differences between groups (past buyers, residents, gender, origin) are mostly not significant, which means we cannot tell, not that they are equal.

## [r5-1] Willingness to pay: how much students say they would pay
Figures: 11_box_prices_three_tiers.png
Takeaway: median HK$30 (bootstrap range HK$28-34); average HK$30.9 once outliers are blanked. In their words: “Uniqueness, price” (respondent row 57, purchase intent 5/5) · “Mostly the price. I watch my spending, so I would only buy one if it costs about the same as a boba or a bottled drink. I would treat it as an occasional treat on hot days.” (respondent row 68, purchase intent 3/5)

## [r5-2] Demand curve and the revenue-maximising price
Figures: 03_demand_curve_by_tier.png
Takeaway: HK$25 has the highest revenue index (price x share); give a range, not a point, and remember cost per cup is not included.

## [r5-3] Same people compared: smoothie willingness to pay vs what they usually spend
Figures: 12_wtp_gap_hist.png, 12_wtp_vs_spend_scatter.png
Takeaway: 92% would pay more than they spend now; a strong result, but hypothetical.

## [r5-4] Does willingness to pay differ by group, and what predicts it?
Figures: 11_box_wtp_by_group.png, 12_models_coef_plot.png
Takeaway: usual spend goes with willingness to pay (p = 0.0008); group differences are mostly not detectable.

## [r5-5] Promotion: support for the pre-order app, loyalty scheme and add-ons
Figures: -
Takeaway: pre-order app 64% agree vs loyalty programme 43%. In their words: “A mango or strawberry smoothie with yogurt would be great in summer. A student discount or loyalty card would help a lot.” (respondent row 47, purchase intent 4/5) · “maybe how the affiliate program would work. (hope i have helped, now i need to do the presentation for the same course as yours. deadline: tomorrow...)” (respondent row 19, purchase inte

## [r5-6] Extra price checks: price tables by tier, spend by group and price tolerance by study year
Figures: 11_box_spend_by_group.png, 12_price_by_study_year.png
Takeaway: usual spend varies by group; for study year, 1 of 3 tests are below 0.05 and the groups are small, so the evidence is mixed.

## [r5-7] Serve 1: cost per cup vs the best price: ILLUSTRATIVE: cost per cup is not measured
Figures: -
Takeaway: the best price depends on a cost we have not measured; get the real cost per cup before quoting a margin.

## [r6-0] Where the data challenges our proposal
Figures: -
Takeaway: affordability and health-first positioning both need rewording. In their words: “Fresh fruit and a fair price matter most. I already buy boba and coffee, so a fruity, refreshing drink for hot afternoons would be a nice change, as long as it is not too sugary or slow to get.” (respondent row 66, purchase intent 4/5) · “Depends on protein and caffeine options and being able to customize. I care about macros and sugar, 

## [r6-1] Limitations to write in the report
Figures: -
Takeaway: small, mostly undergraduate convenience sample; hypothetical prices; many tests; AI-coded text.

## [r6-2] How sure are we? Do the conclusions survive different cleaning choices?
Figures: -
Takeaway: 4 of 31 tests change with cleaning (mostly because of tier A's extreme answers); median WTP and the revenue-maximising price are the same in every tier.

## [r6-4] Why do we think our product works? Evidence checklist
Figures: -
Takeaway: demand (70%), price headroom (HK$30 vs HK$10) and taste-first positioning support the product; the risks are the small convenience sample, stated (not real) behaviour and unmeasured cost.

## [r6-5] Extra checks that affect how sure we can be
Figures: -
Takeaway: comparisons that survive correction in the main sample: On campus daily (vs 1-4 d) vs Campus drinks / week; Price weighted > median vs Weight: freshness; none of them is about smoothie willingness to pay or purchase intent.

## [r6-6] Serve 2: what a price test would show: best price vs the next candidate
Figures: -
Takeaway: HK$25 vs HK$28 is a 17-point difference in buyers on stated demand; a real test needs about 117 people per price.

## [r7-2] Files not shown in this report
Figures: -
Takeaway: nothing important is hidden; this lists what else exists. APPENDIX A Appendix A: every question, overall distribution under the three tiers Questions are numbered as in the survey, the same numbers as in Appendix B, so each chart can be matched to its exact wording and answer options. Grey = A all submissions, pink = B cleaned, red = C cleaned with price outliers blanked. Price questions also have box plots. Survey q