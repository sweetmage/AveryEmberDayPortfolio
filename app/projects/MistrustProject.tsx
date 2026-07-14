export default function MistrustProject() {
  return (
    <>
      {/* Hero */}
      <div className="project-hero mx-auto max-w-(--brand-content-max) px-6 pt-20 pb-12">
        <h2 className="project-title mb-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-text border-none p-0 normal-case tracking-normal font-normal">
          A History of Mistrust
        </h2>
      </div>

      {/* Description */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h3 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Description
        </h3>
        <p className="project-desc m-0 max-w-[640px] font-body text-base leading-[1.7] text-text-soft">
          A long form Instagram carousel series with 3 sets of 10 slides examining
          the roots and ripple effects of medical mistrust, spanning the Tuskegee
          syphilis study, HIV/AIDS era stigma, contemporary LGBTQ+ health
          disparities, and the community led models offering a way forward. Backed
          by full preproduction including moodboard, storyboards, and process
          documentation.
        </p>
      </section>

      {/* Per-set slideshows */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h3 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Slideshow
        </h3>
        <div className="set-slideshows">
          <div className="set-slideshow" data-set="1">
            <p className="set-ss-label">Set 1 · Slides 1–10</p>
            <div className="set-ss-viewer" role="region" aria-label="Set 1 slide viewer">
              <div className="set-ss-track" />
            </div>
            <p className="set-ss-caption" aria-live="polite" />
            <div className="set-ss-controls">
              <button className="set-ss-prev" aria-label="Previous slide, set 1">&#8249; Prev</button>
              <span className="set-ss-counter">Slide 1 of 10</span>
              <button className="set-ss-next" aria-label="Next slide, set 1">Next &#8250;</button>
            </div>
          </div>
          <div className="set-slideshow" data-set="2">
            <p className="set-ss-label">Set 2 · Slides 11–20</p>
            <div className="set-ss-viewer" role="region" aria-label="Set 2 slide viewer">
              <div className="set-ss-track" />
            </div>
            <p className="set-ss-caption" aria-live="polite" />
            <div className="set-ss-controls">
              <button className="set-ss-prev" aria-label="Previous slide, set 2">&#8249; Prev</button>
              <span className="set-ss-counter">Slide 1 of 10</span>
              <button className="set-ss-next" aria-label="Next slide, set 2">Next &#8250;</button>
            </div>
          </div>
          <div className="set-slideshow" data-set="3">
            <p className="set-ss-label">Set 3 · Slides 21–30</p>
            <div className="set-ss-viewer" role="region" aria-label="Set 3 slide viewer">
              <div className="set-ss-track" />
            </div>
            <p className="set-ss-caption" aria-live="polite" />
            <div className="set-ss-controls">
              <button className="set-ss-prev" aria-label="Previous slide, set 3">&#8249; Prev</button>
              <span className="set-ss-counter">Slide 1 of 10</span>
              <button className="set-ss-next" aria-label="Next slide, set 3">Next &#8250;</button>
            </div>
          </div>
        </div>
      </section>

      {/* Moodboard & Storyboard */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h3 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Moodboard & Storyboard
        </h3>
        <div className="supporting-grid grid grid-cols-1 gap-6 min-[600px]:grid-cols-2">
          <div className="supporting-card overflow-hidden rounded-lg border border-line bg-surface-1 [&_img]:block [&_img]:h-auto [&_img]:w-full">
            <img
              src="/images/myart/A History of Mistrust/supporting material/HistoryofMistrustMoodboard-cropped.png"
              alt="A History of Mistrust moodboard"
              loading="lazy"
              decoding="async"
            />
            <div className="supporting-card-label border-t border-line px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
              <strong>Moodboard</strong>
              <span>Visual research and reference</span>
            </div>
          </div>
          <div className="supporting-card overflow-hidden rounded-lg border border-line bg-surface-1 [&_img]:block [&_img]:h-auto [&_img]:w-full">
            <img
              src="/images/myart/A History of Mistrust/supporting material/aHistoryOfMistrustStoryboard.jpg"
              alt="A History of Mistrust storyboard"
              loading="lazy"
              decoding="async"
            />
            <div className="supporting-card-label border-t border-line px-4 py-3 [&_span]:font-body [&_span]:text-xs [&_span]:text-text-muted [&_strong]:block [&_strong]:font-body [&_strong]:text-sm [&_strong]:font-medium [&_strong]:text-text">
              <strong>Storyboard</strong>
              <span>Layout and flow planning</span>
            </div>
          </div>
        </div>
      </section>

      {/* All Slides */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h3 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          All Slides
        </h3>
        <div className="all-sets-full flex w-full flex-col gap-6">
          <div
            className="carousel-set relative w-full cursor-pointer overflow-hidden rounded-lg border border-line bg-surface-1 transition-colors hover:border-accent-dim [&_img]:block [&_img]:h-auto [&_img]:w-full"
            data-set="1"
          >
            <img
              src="/images/myart/A History of Mistrust/sets/set-1.webp"
              alt="A History of Mistrust carousel, slides 1 through 10 combined"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div
            className="carousel-set relative w-full cursor-pointer overflow-hidden rounded-lg border border-line bg-surface-1 transition-colors hover:border-accent-dim [&_img]:block [&_img]:h-auto [&_img]:w-full"
            data-set="2"
          >
            <img
              src="/images/myart/A History of Mistrust/sets/set-2.webp"
              alt="A History of Mistrust carousel, slides 11 through 20 combined"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div
            className="carousel-set relative w-full cursor-pointer overflow-hidden rounded-lg border border-line bg-surface-1 transition-colors hover:border-accent-dim [&_img]:block [&_img]:h-auto [&_img]:w-full"
            data-set="3"
          >
            <img
              src="/images/myart/A History of Mistrust/sets/set-3.webp"
              alt="A History of Mistrust carousel, slides 21 through 30 combined"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="project-section mx-auto max-w-(--brand-content-max) px-6 pb-20">
        <h3 className="section-title mb-8 border-none p-0 text-left font-heading text-2xl font-semibold normal-case tracking-normal text-ir-4">
          Sources & Bibliography
        </h3>
        <ul className="sources-list m-0 list-none gap-x-12 p-0 columns-1 min-[700px]:columns-2 min-[1100px]:columns-3 [&_a]:break-words [&_a]:text-text-soft [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-accent [&_li]:mb-3 [&_li]:break-inside-avoid [&_li]:pl-6 [&_li]:-indent-6 [&_li]:font-body [&_li]:text-[0.82rem] [&_li]:leading-[1.55] [&_li]:text-text-muted">
          <li>AIDSVu. (2024). <em>AIDSVu Releases 2024 PrEP Use Data</em>. Emory University Rollins School of Public Health. <a href="https://aidsvu.org/news-updates/aidsvu-releases-2024-prep-use-data-showing-growing-use-across-the-u-s/" target="_blank">Link</a></li>
          <li>Alsan, M., Garrick, O., & Graziani, G. C. (2019). Does Diversity Matter for Health? Experimental Evidence from Oakland. <em>American Economic Review, 109</em>(12), 4071-4111. <a href="https://pubs.aeaweb.org/doi/10.1257/aer.20181446" target="_blank">Link</a></li>
          <li>American Medical Association (AMA). (2023). <em>Physicians can realize their power to advance health equity</em>. National Health Equity Grand Rounds. <a href="https://www.ama-assn.org/public-health/health-equity/physicians-can-realize-their-power-advance-health-equity" target="_blank">Link</a></li>
          <li>Association of American Medical Colleges (AAMC). (2005). <em>Cultural Competence Education</em>. <a href="https://www.aamc.org/media/20856/download" target="_blank">Link</a></li>
          <li>California State Auditor. (2014). <em>Sterilization of Female Inmates: Some Inmates Were Sterilized Following Violations of State Law and Established Policies and Procedures</em>. <a href="https://information.auditor.ca.gov/pdfs/reports/2013-120.pdf" target="_blank">Link</a></li>
          <li>Centers for Disease Control and Prevention (CDC). (2024). <em>Breast Cancer Among Young Women</em>. <a href="https://www.cdc.gov/united-states-cancer-statistics/publications/breast-cancer-among-young-women.html" target="_blank">Link</a></li>
          <li>Centers for Disease Control and Prevention (CDC). (2024). <em>HIV Diagnoses</em>. <a href="https://www.hiv.gov/hiv-basics/overview/data-and-trends/statistics" target="_blank">Link</a></li>
          <li>Centers for Disease Control and Prevention (CDC). (2024). <em>The Untreated Syphilis Study at Tuskegee Timeline</em>. <a href="https://www.cdc.gov/tuskegee/about/timeline.html" target="_blank">Link</a></li>
          <li>CNET. (2025). <em>How to access important health info that's been scrubbed from the CDC site</em>. <a href="https://www.cnet.com/tech/services-and-software/how-to-access-important-health-info-thats-been-scrubbed-from-the-cdc-site/" target="_blank">Link</a></li>
          <li>Dick, B. (2024). <em>When Homosexuality Stopped Being a Mental Disorder in the DSM</em>. National Alliance on Mental Illness (NAMI). <a href="https://www.namisb.org/blog/blogs-articles-news-2/when-homosexuality-stopped-being-a-mental-disorder-in-the-dsm-5" target="_blank">Link</a></li>
          <li>Georgia State University Library. (n.d.). <em>Reagan's Response</em>. Out in the Archives: Documenting LGBTQ History. <a href="https://exhibits.library.gsu.edu/out-in-the-archives/hiv-aids/reagans-response/" target="_blank">Link</a></li>
          <li>Hoffman, K. M., Trawalter, S., Axt, J. R., & Oliver, M. N. (2016). Racial bias in pain assessment and treatment recommendations, and false beliefs about biological differences between blacks and whites. <em>Proceedings of the National Academy of Sciences, 113</em>(16), 4296-4301. <a href="https://www.pnas.org/doi/10.1073/pnas.1516047113" target="_blank">Link</a></li>
          <li>Kaiser Family Foundation (KFF). (2023). <em>Access Uncertain for New Injectable PrEP As the Affordable Care Act's (ACA) Open Enrollment Begins</em>. <a href="https://www.kff.org/hiv-aids/access-uncertain-for-new-injectable-prep-as-the-affordable-care-acts-aca-open-enrollment-begins/" target="_blank">Link</a></li>
          <li>Kaiser Family Foundation (KFF). (2023). <em>LGBT Adults' Experiences with Discrimination and Health Care Disparities</em>. <a href="https://www.kff.org/racial-equity-and-health-policy/lgbt-adults-experiences-with-discrimination-and-health-care-disparities-findings-from-the-kff-survey-of-racism-discrimination-and-health/" target="_blank">Link</a></li>
          <li>Lambda Legal. (2010). <em>When Health Care Isn't Caring: Lambda Legal's Survey of Discrimination Against LGBT People and People with HIV</em>. <a href="https://lambdalegal.org/wp-content/uploads/2011/10/whcic-report_when-health-care-isnt-caring.pdf" target="_blank">Link</a></li>
          <li>MacCarthy, S., et al. (2022). <em>The Benefit of Affirming Care for LGBTQ+ Population Health</em>. AcademyHealth / MedRxiv. <a href="https://www.medrxiv.org/content/10.1101/2022.05.26.22275633v1.full-text" target="_blank">Link</a></li>
          <li>National Center for Transgender Equality & National LGBTQ Task Force. (2011). <em>Injustice at Every Turn: A Report of the National Transgender Discrimination Survey</em>. <a href="https://www.thetaskforce.org/app/uploads/2019/07/ntds_full.pdf" target="_blank">Link</a></li>
          <li>NIH National Library of Medicine. (2024). <em>Medical Mistrust Becomes a Social Determinant of Health, Leading to Health Inequities</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11944586/" target="_blank">Link</a></li>
          <li>Price, G. N., & Darity, W. A. (2020). <em>Did North Carolina Economically Breed-Out Blacks During its Historical Eugenic Sterilization Campaign?</em> American Review of Political Economy. <a href="https://today.duke.edu/2020/07/new-paper-examines-disproportionate-effect-eugenics-nc%E2%80%99s-black-population" target="_blank">Link</a></li>
          <li>Trepka, M. J., et al. (2016). <em>Delayed HIV diagnosis among men who have sex with men</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5263177/" target="_blank">Link</a></li>
          <li>U.S. General Accounting Office. (1976). <em>Formulation of the Indian Health Service</em>. Native Voices Timeline. <a href="https://www.nlm.nih.gov/nativevoices/timeline/543.html" target="_blank">Link</a></li>
          <li>UNAIDS. (2024). <em>Global HIV statistics</em>. <a href="https://www.unaids.org/sites/default/files/media_asset/UNAIDS_FactSheet_en.pdf" target="_blank">Link</a></li>
          <li>Whitman-Walker Institute. (2022). <em>Whitman-Walker Institute and Partners Release First Research on Trans and Nonbinary Health</em>. <a href="https://www.whitman-walker.org/whitman-walker-institute-and-partners-release-first-research-findings-for-trans-and-nonbinary-health/" target="_blank">Link</a></li>
          <li>American Psychiatric Association. <em>Working with LGBTQ Patients</em>. <a href="https://www.psychiatry.org/psychiatrists/diversity/education/best-practice-highlights/working-with-lgbtq-patients" target="_blank">Link</a></li>
          <li>NAMI San Bernardino. <em>When Homosexuality Stopped Being a Mental Disorder in the DSM</em>. <a href="https://www.namisb.org/blog/blogs-articles-news-2/when-homosexuality-stopped-being-a-mental-disorder-in-the-dsm-5" target="_blank">Link</a></li>
          <li>PMC - NIH. <em>Out of DSM: Depathologizing Homosexuality</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4695779/" target="_blank">Link</a></li>
          <li>Annual Reviews. <em>History and Iatrogenic Effects of Conversion Therapy</em>. <a href="https://www.annualreviews.org/content/journals/10.1146/annurev-clinpsy-080822-052144?crawler=true&mimetype=application/pdf" target="_blank">Link</a></li>
          <li>Psychology Town. <em>Homosexuality: From Pathology to Acceptance</em>. <a href="https://psychology.town/mental-health-in-special-areas/homosexuality-pathology-to-acceptance/" target="_blank">Link</a></li>
          <li>PMC. <em>R. Spitzer and the depathologization of homosexuality: some considerations on the 50th anniversary</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11083874/" target="_blank">Link</a></li>
          <li>AACN. <em>Caring for LGBTQ+ Patients in Critical and Progressive Care</em>. <a href="https://www.aacn.org/blog/caring-for-lgbtq-patients-in-critical-and-progressive-care" target="_blank">Link</a></li>
          <li>PMC. <em>Broken down by bias: Healthcare biases experienced by BIPOC and LGBTQ+ patients</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8861755/" target="_blank">Link</a></li>
          <li>Brandeis ScholarWorks. <em>The Illegitimacy of Sterilization: The Merging of Welfare and Eugenics in North Carolina, 1929-2015</em>. <a href="https://scholarworks.brandeis.edu/view/pdfCoverPage?instCode=01BRAND_INST&filePid=13419020920001921&download=true" target="_blank">Link</a></li>
          <li>Lawrence, J. (2000). The Indian Health Service and the Sterilization of Native American Women. <em>The American Indian Quarterly, 24</em>(3), 400-419. <a href="https://doi.org/10.1353/aiq.2000.0008" target="_blank">Link</a></li>
          <li>Government Accountability Office (GAO). <em>HRD-77-3 Investigation of Allegations Concerning Indian Health Service</em>. <a href="https://www.gao.gov/assets/hrd-77-3.pdf" target="_blank">Link</a></li>
          <li>PBS. <em>Unwanted Sterilization and Eugenics Programs in the United States</em>. <a href="https://www.pbs.org/independentlens/blog/unwanted-sterilization-and-eugenics-programs-in-the-united-states/" target="_blank">Link</a></li>
          <li>PMC. <em>California's Sterilization Survivors: An Estimate and Call for Redress</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5308144/" target="_blank">Link</a></li>
          <li>Prison Policy. <em>&quot;If They Hand You a Paper, You Sign It&quot;: A Call to End the Sterilization of Women in Prison</em>. <a href="https://www.prisonpolicy.org/scans/Roth_If_They_Hand_You_1_15_2015.pdf" target="_blank">Link</a></li>
          <li>Stern, A. M. (2005). STERILIZED in the Name of Public Health. Race, Immigration, and Reproductive Control in Modern California. <em>American Journal of Public Health, 95</em>(7), 1128-1138. <a href="https://doi.org/10.2105/ajph.2004.041608" target="_blank">Link</a></li>
          <li>PMC. <em>STERILIZED in the Name of Public Health: Race, Immigration, and Reproductive Control in Modern California</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC1449330/" target="_blank">Link</a></li>
          <li>Embryo Project Encyclopedia. <em>The Tuskegee Syphilis Study (1932–1972)</em>. <a href="https://embryo.asu.edu/pages/tuskegee-syphilis-study-1932-1972" target="_blank">Link</a></li>
          <li>PMC. <em>Fiftieth Anniversary of Uncovering the Tuskegee Syphilis Study: The Story and Timeless Lessons</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9872801/" target="_blank">Link</a></li>
          <li>CDC. <em>About The Untreated Syphilis Study at Tuskegee</em>. <a href="https://www.cdc.gov/tuskegee/about/index.html" target="_blank">Link</a></li>
          <li>Reagan Presidential Library. <em>The President's News Conference</em>. <a href="https://www.reaganlibrary.gov/archives/speech/presidents-news-conference-16" target="_blank">Link</a></li>
          <li>Swarthmore College. <em>Silence From the Great Communicator: The Early Years of the AIDS Epidemic Under the Reagan Administration</em>. <a href="https://works.swarthmore.edu/cgi/viewcontent.cgi?article=1167&context=suhj" target="_blank">Link</a></li>
          <li>CIDRAP. <em>Removal of pages from CDC website brings confusion, dismay</em>. <a href="https://www.cidrap.umn.edu/public-health/removal-pages-cdc-website-brings-confusion-dismay" target="_blank">Link</a></li>
          <li>PMC. <em>Rewriting women's health: a content analysis of the Trump administration's revisions to womenshealth.gov</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12613099/" target="_blank">Link</a></li>
          <li>PMC. <em>Medical Mistrust: A Concept Analysis</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11944586/" target="_blank">Link</a></li>
          <li>PMC. <em>Medical mistrust, racism, and delays in preventive health screening among African-American men</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8620213/" target="_blank">Link</a></li>
          <li>Health Affairs. <em>Challenges To Reducing Discrimination And Health ...</em>. <a href="https://www.healthaffairs.org/doi/abs/10.1377/hlthaff.2016.1091?journalCode=hlthaff" target="_blank">Link</a></li>
          <li>PMC. <em>PrEP-Related Medical, Structural and Institutional Mistrust among a Socioeconomically Diverse Sample of Black, Latine, Asian, and White Young Sexual Minority Men</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12929284/" target="_blank">Link</a></li>
          <li>PMC. <em>Medical Mistrust Among Black Patients with Serious Illness: A Mixed Methods Study</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11534910/" target="_blank">Link</a></li>
          <li>CDC. <em>HIV Diagnoses, Deaths, and Prevalence | HIV Data</em>. <a href="https://www.cdc.gov/hiv-data/nhss/hiv-diagnoses-deaths-prevalence.html" target="_blank">Link</a></li>
          <li>AIDSVu. <em>AIDSVu Releases New PrEP Data and Launches PrEPVu.org</em>. <a href="https://aidsvu.org/news-updates/aidsvu-releases-new-prep-data-and-launches-prepvu-org-a-new-prep-equity-platform/" target="_blank">Link</a></li>
          <li>AIDSVu. <em>AIDSVu Releases New Data Highlighting Ongoing Inequities in PrEP Use</em>. <a href="https://aidsvu.org/news-updates/news-updates-aidsvu-releases-new-data-highlighting-ongoing-inequities-in-prep-use-among-black-and-hispanic-people-and-across-regions-of-the-county/" target="_blank">Link</a></li>
          <li>Health Affairs. <em>Estimating The Impact Of Out-Of-Pocket Cost Changes On Abandonment Of HIV Pre-Exposure Prophylaxis</em>. <a href="https://www.healthaffairs.org/doi/10.1377/hlthaff.2023.00808" target="_blank">Link</a></li>
          <li>Satcher Institute. <em>The Impact of HIV on Elder Black Same Gender Loving Men (SGLM)</em>. <a href="https://satcherinstitute.org/news/the-impact-of-hiv-on-elder-black-same-gender-loving-men" target="_blank">Link</a></li>
          <li>PSNet. <em>Racial bias in pain assessment and treatment recommendations...</em>. <a href="https://psnet.ahrq.gov/issue/racial-bias-pain-assessment-and-treatment-recommendations-and-false-beliefs-about-biological" target="_blank">Link</a></li>
          <li>The Cancer Network. <em>National Transgender Discrimination Survey Report on health and health care</em>. <a href="https://cancer-network.org/wp-content/uploads/2017/02/National_Transgender_Discrimination_Survey_Report_on_health_and_health_care.pdf" target="_blank">Link</a></li>
          <li>Advocates for Trans Equality. <em>National Transgender Discrimination Survey: Full Report</em>. <a href="https://transequality.org/resources/national-transgender-discrimination-survey-full-report" target="_blank">Link</a></li>
          <li>PMC. <em>Identifying and Addressing Barriers to Transgender Healthcare</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8606364/" target="_blank">Link</a></li>
          <li>PubMed. <em>Racial bias in pain assessment and treatment recommendations...</em>. <a href="https://pubmed.ncbi.nlm.nih.gov/27044069/" target="_blank">Link</a></li>
          <li>SF.gov. <em>HIV Epidemiology Annual Report 2022</em>. <a href="https://www.sf.gov/sites/default/files/2023-12/AnnualReport2022%2020231109Final_0.pdf" target="_blank">Link</a></li>
          <li>AJPH. <em>Trends and Racial Disparities of Late-Stage HIV Diagnosis: Hawaii, 2010–2016</em>. <a href="https://ajph.aphapublications.org/doi/full/10.2105/AJPH.2018.304506" target="_blank">Link</a></li>
          <li>SEER Program. <em>Cancer Stat Facts: Female Breast Cancer</em>. <a href="https://seer.cancer.gov/statfacts/html/breast.html" target="_blank">Link</a></li>
          <li>CDC. <em>Vital Signs: Racial Disparities in Breast Cancer Severity — United States, 2005–2009</em>. <a href="https://www.cdc.gov/mmwr/preview/mmwrhtml/mm6145a5.htm" target="_blank">Link</a></li>
          <li>American Cancer Society. <em>Breast Cancer Facts & Figures 2024-2025</em>. <a href="https://www.cancer.org/content/dam/cancer-org/research/cancer-facts-and-statistics/breast-cancer-facts-and-figures/2024/breast-cancer-facts-and-figures-2024.pdf" target="_blank">Link</a></li>
          <li>WHO. <em>HIV - World Health Organization</em>. <a href="https://www.who.int/data/gho/data/themes/hiv-aids" target="_blank">Link</a></li>
          <li>UNAIDS. <em>Global HIV & AIDS statistics — Fact sheet</em>. <a href="https://www.unaids.org/en/resources/fact-sheet" target="_blank">Link</a></li>
          <li>Howard Brown Health. <em>Community Based Research</em>. <a href="https://howardbrown.org/era/research/community-based-research/" target="_blank">Link</a></li>
          <li>PMC. <em>Health Communication and Sexual Orientation, Gender Identity, and Expression</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9219031/" target="_blank">Link</a></li>
          <li>PMC. <em>Community engagement to improve access to healthcare: a comparative case study to advance implementation science for transgender health equity</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9339189/" target="_blank">Link</a></li>
          <li>NBER. <em>Does Diversity Matter for Health? Experimental Evidence from Oakland</em>. <a href="https://www.nber.org/system/files/working_papers/w24787/w24787.pdf" target="_blank">Link</a></li>
          <li>Poverty Action Lab. <em>Matching Provider Race to Increase Take-up of Preventive Health Services among Black Men in the United States</em>. <a href="https://www.povertyactionlab.org/evaluation/matching-provider-race-increase-take-preventive-health-services-among-black-men-united" target="_blank">Link</a></li>
          <li>PMC. <em>Association of Affirming Care with Chronic Disease and Preventive Care Outcomes among Lesbian, Gay, Bisexual, Transgender, and Queer Older Adults</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10251765/" target="_blank">Link</a></li>
          <li>FOLX HEALTH. <em>Do LGBTQIA+ Health Care Providers Improve LGBTQIA+ Well-being?</em>. <a href="https://www.folxhealth.com/library/do-lgbtqia-health-care-providers-improve-lgbtqia-well-being" target="_blank">Link</a></li>
          <li>AcademyHealth. <em>The Benefit of Affirming Care for LGBTQ+ Population Health</em>. <a href="https://academyhealth.org/blog/2022-06/benefit-affirming-care-lgbtq-population-health" target="_blank">Link</a></li>
          <li>MedEdPORTAL. <em>Structural Competency: Curriculum for Medical Students, Residents, and Interprofessional Teams on the Structural Factors That Produce Health Disparities</em>. <a href="https://www.mededportal.org/doi/10.15766/mep_2374-8265.10888" target="_blank">Link</a></li>
          <li>PMC. <em>A review on cultural competency in medical education</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9638640/" target="_blank">Link</a></li>
          <li>AAMC. <em>Assessing Change: Evaluating Cultural Competence Education and Training</em>. <a href="https://www.aamc.org/media/33226/download" target="_blank">Link</a></li>
          <li>PMC. <em>Cultural competency education in the medical curriculum to overcome health care disparities</em>. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10443984/" target="_blank">Link</a></li>
          <li>The Spokesman-Review. <em>Black Women Told To Fight On, Even When Battle Unbearable</em>. <a href="https://www.spokesman.com/stories/1995/jul/10/black-women-told-to-fight-on-even-when-battle/" target="_blank">Link</a></li>
          <li>Professional Heart Daily. <em>Priority for Cardiovascular Health Equity among U.S. Women</em>. <a href="https://professional.heart.org/en/science-news/cardiovascular-disease-risk-factors-in-women-impact-of-race/commentary" target="_blank">Link</a></li>
        </ul>
      </section>
    </>
  );
}
