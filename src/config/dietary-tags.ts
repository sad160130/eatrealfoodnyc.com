export const DIET_CONFIG: Record<string, {
  label: string
  emoji: string
  intro: string
  whatIs: string
  faqs: Array<{ question: string; answer: string }>
}> = {
  'vegan': {
    label: 'Vegan',
    emoji: '🌱',
    intro: 'New York City is one of the best cities in the world for vegan dining, with hundreds of dedicated vegan restaurants spanning every cuisine and price point. From upscale plant-based fine dining in Manhattan to budget-friendly vegan soul food in Brooklyn, NYC\'s vegan restaurant scene is thriving and constantly growing. This directory lists every vegan and vegan-friendly restaurant in all five boroughs, complete with health inspection grades and neighborhood-level filtering.',
    whatIs: 'Vegan restaurants serve food that contains no animal products whatsoever — no meat, poultry, seafood, dairy, eggs, or honey. Restaurants tagged vegan in this directory either exclusively serve vegan food or have a substantial vegan menu.',
    faqs: [
      { question: 'How many vegan restaurants are in NYC?', answer: 'NYC has hundreds of dedicated vegan restaurants across all five boroughs, with the highest concentrations in Manhattan and Brooklyn.' },
      { question: 'Which NYC neighborhood has the most vegan restaurants?', answer: 'The East Village, Chelsea, and Williamsburg consistently rank as the top neighborhoods for vegan dining in NYC.' },
      { question: 'Are vegan restaurants in NYC expensive?', answer: 'Vegan restaurants in NYC range from very affordable to upscale. Many budget-friendly options exist, particularly in Brooklyn and Queens, with meals available from $10-15 per person.' },
      { question: 'Do vegan restaurants in NYC have gluten-free options?', answer: 'Many vegan restaurants in NYC also offer gluten-free dishes. Use the combined vegan and gluten-free filter to find restaurants that accommodate both needs.' },
      { question: 'Are there vegan restaurants open late in NYC?', answer: 'Yes — several vegan restaurants in NYC stay open late, particularly in Manhattan neighborhoods like the East Village and Midtown.' },
    ]
  },
  'vegetarian': {
    label: 'Vegetarian',
    emoji: '🥦',
    intro: 'NYC\'s vegetarian restaurant scene is vast and diverse, spanning everything from traditional Indian vegetarian cuisine in Queens to upscale farm-to-table vegetarian dining in Manhattan. This directory covers all vegetarian and vegetarian-friendly restaurants across all five boroughs.',
    whatIs: 'Vegetarian restaurants serve food with no meat, poultry, or seafood, but may include dairy products and eggs. Restaurants tagged vegetarian in this directory either exclusively or primarily serve vegetarian food.',
    faqs: [
      { question: 'Are there good vegetarian restaurants in NYC?', answer: 'Yes — NYC has an excellent selection of vegetarian restaurants across all boroughs and cuisines, from Indian vegetarian to Italian and American.' },
      { question: 'What is the difference between vegan and vegetarian restaurants?', answer: 'Vegetarian restaurants exclude meat but may serve dairy and eggs. Vegan restaurants exclude all animal products including dairy, eggs, and honey.' },
      { question: 'Which cuisine types are most vegetarian-friendly in NYC?', answer: 'Indian, Mediterranean, Middle Eastern, and Asian cuisines typically offer the most extensive vegetarian options in NYC.' },
      { question: 'Are vegetarian restaurants more affordable than regular restaurants?', answer: 'Vegetarian restaurants in NYC span all price points, but many offer very competitive pricing since plant-based ingredients are often less expensive than meat.' },
      { question: 'Can I find vegetarian options in every NYC borough?', answer: 'Yes — all five boroughs have good vegetarian restaurant options, though Manhattan and Brooklyn have the highest concentrations.' },
    ]
  },
  'gluten-free': {
    label: 'Gluten-Free',
    emoji: '🌾',
    intro: 'Finding genuinely gluten-free restaurants in NYC requires knowing where to look. This directory identifies restaurants that explicitly offer gluten-free menus or operate dedicated gluten-free kitchens, making it easier for people with celiac disease or gluten sensitivity to dine safely and confidently across all five boroughs.',
    whatIs: 'Restaurants tagged gluten-free in this directory explicitly offer gluten-free menu options, dedicated gluten-free menus, or operate gluten-free kitchens. Always confirm with the restaurant about cross-contamination protocols if you have celiac disease.',
    faqs: [
      { question: 'Are there dedicated gluten-free restaurants in NYC?', answer: 'Yes — NYC has several fully dedicated gluten-free restaurants and bakeries, particularly in Manhattan, that operate entirely gluten-free kitchens.' },
      { question: 'Is it safe for celiac disease sufferers to eat at gluten-free tagged restaurants?', answer: 'Always confirm directly with the restaurant about their cross-contamination protocols. The gluten-free tag indicates they offer gluten-free options but does not guarantee a celiac-safe kitchen.' },
      { question: 'Which cuisines are most naturally gluten-free friendly?', answer: 'Mexican (corn-based), Thai, Japanese (with tamari), and many Indian cuisines offer naturally gluten-free options. Many of these restaurants in NYC are well-equipped to accommodate gluten-free diners.' },
      { question: 'Are there gluten-free pizza options in NYC?', answer: 'Yes — many NYC pizzerias now offer gluten-free crusts, though dedicated gluten-free pizzerias with zero cross-contamination are rarer.' },
      { question: 'How do I find gluten-free restaurants near me in NYC?', answer: 'Use the neighborhood filter combined with the gluten-free dietary filter on this page to find gluten-free options in your specific NYC neighborhood.' },
    ]
  },
  'halal': {
    label: 'Halal',
    emoji: '🕌',
    intro: 'New York City has one of the largest and most diverse halal dining scenes in the United States, reflecting the city\'s large and culturally rich Muslim population. From the iconic halal food carts of Midtown Manhattan to dedicated halal restaurants serving Pakistani, Bangladeshi, Middle Eastern, and West African cuisine across Queens, Brooklyn, and the Bronx, NYC offers an extraordinary range of halal dining options.',
    whatIs: 'Halal restaurants serve food prepared according to Islamic dietary law, which prohibits pork and requires that meat be slaughtered in a specific way. Restaurants tagged halal in this directory are either halal-certified or explicitly advertise as halal.',
    faqs: [
      { question: 'Where are the best halal restaurants in NYC?', answer: 'Jackson Heights in Queens, the Bronx, and Midtown Manhattan have some of the highest concentrations of halal restaurants in NYC.' },
      { question: 'Are NYC halal food carts as good as restaurants?', answer: 'NYC\'s halal food carts, particularly the famous Halal Guys cart in Midtown, are iconic and well-regarded. This directory focuses on brick-and-mortar halal restaurants across all five boroughs.' },
      { question: 'What cuisines are commonly available at halal NYC restaurants?', answer: 'Pakistani, Bangladeshi, Indian, Middle Eastern, Yemeni, and West African cuisines dominate NYC\'s halal restaurant scene, though halal versions of American, Caribbean, and other cuisines are also available.' },
      { question: 'How do I verify if a restaurant is genuinely halal certified?', answer: 'Look for halal certification certificates displayed in the restaurant window, or ask the restaurant directly about their halal sourcing. This directory tags restaurants that self-identify or are certified as halal.' },
      { question: 'Are there halal restaurants in Manhattan?', answer: 'Yes — Manhattan has a strong selection of halal restaurants, particularly in Midtown, the Upper West Side, and Harlem.' },
    ]
  },
  'kosher': {
    label: 'Kosher',
    emoji: '✡️',
    intro: 'New York City is home to one of the largest Jewish communities in the world, and its kosher restaurant scene reflects that heritage with an extraordinary range of options from traditional Eastern European Jewish cuisine to modern Israeli, kosher sushi, and upscale kosher steakhouses.',
    whatIs: 'Kosher restaurants prepare food in accordance with Jewish dietary law, which includes separation of meat and dairy, prohibition of pork and shellfish, and requirements for how meat is slaughtered and prepared. Restaurants tagged kosher in this directory are kosher-certified or kosher-observant.',
    faqs: [
      { question: 'Where are the best kosher restaurants in NYC?', answer: 'The Upper West Side, Midtown Manhattan, and Borough Park in Brooklyn have the highest concentrations of kosher restaurants in NYC.' },
      { question: 'Are there kosher restaurants in all five boroughs?', answer: 'Yes — while Manhattan has the largest selection, all five boroughs have kosher restaurant options reflecting their Jewish communities.' },
      { question: 'Can non-Jewish people eat at kosher restaurants?', answer: 'Absolutely — kosher restaurants are open to everyone. Many people choose kosher restaurants for their food quality standards and dietary transparency.' },
      { question: 'Are kosher restaurants more expensive?', answer: 'Kosher restaurants can be more expensive due to the additional certification and sourcing requirements, but budget-friendly kosher options exist throughout NYC.' },
      { question: 'What types of cuisine are available at kosher NYC restaurants?', answer: 'NYC\'s kosher restaurant scene spans Israeli, Middle Eastern, American, sushi, Italian, and traditional Jewish cuisine, offering a surprisingly wide range of culinary options.' },
    ]
  },
  'dairy-free': {
    label: 'Dairy-Free',
    emoji: '🥛',
    intro: 'Whether you are lactose intolerant, have a dairy allergy, or simply prefer to avoid dairy products, NYC has a growing number of restaurants that explicitly cater to dairy-free diners with dedicated menu options and dairy-free alternatives.',
    whatIs: 'Restaurants tagged dairy-free in this directory primarily offer dairy-free menu options or explicitly promote dairy-free alternatives. Many vegan restaurants are inherently dairy-free.',
    faqs: [
      { question: 'Are vegan restaurants automatically dairy-free?', answer: 'Yes — vegan restaurants exclude all animal products including dairy. If you need dairy-free options, filtering for vegan restaurants will show you completely dairy-free establishments.' },
      { question: 'Which cuisines are naturally dairy-free in NYC?', answer: 'Many Asian cuisines including Chinese, Thai, Vietnamese, and Japanese cooking use little to no dairy, making them naturally dairy-free friendly.' },
      { question: 'Are there dairy-free dessert options in NYC?', answer: 'Yes — many NYC bakeries and dessert shops now offer dairy-free and vegan dessert options including ice cream made from oat, almond, or coconut milk.' },
      { question: 'How do I find dairy-free restaurants near me in NYC?', answer: 'Use the dairy-free dietary filter combined with the neighborhood filter on this page to find dairy-free friendly restaurants in your area.' },
      { question: 'Do dairy-free restaurants also cater to other allergies?', answer: 'Many dairy-free restaurants in NYC are also aware of other common allergens. Always inform your server about any allergies when dining out.' },
    ]
  },
  'keto': {
    label: 'Keto',
    emoji: '🥑',
    intro: 'Following a ketogenic diet in NYC is increasingly feasible as more restaurants explicitly offer keto-friendly menu options featuring high-fat, low-carbohydrate dishes. This directory identifies NYC restaurants that genuinely cater to keto dieters.',
    whatIs: 'Keto-friendly restaurants offer dishes that are very low in carbohydrates and high in healthy fats and proteins, aligning with the macronutrient ratios required for ketosis. Restaurants tagged keto explicitly market keto-friendly menu options.',
    faqs: [
      { question: 'What types of restaurants are best for keto in NYC?', answer: 'Steakhouses, seafood restaurants, and many Mediterranean and Greek restaurants naturally offer keto-friendly options with their emphasis on protein and healthy fats.' },
      { question: 'Can I eat keto at regular NYC restaurants?', answer: 'Yes — many regular restaurants in NYC can accommodate keto requests by substituting starchy sides for salad or vegetables. Restaurants tagged keto in this directory explicitly offer keto-friendly options.' },
      { question: 'Are there dedicated keto restaurants in NYC?', answer: 'Fully dedicated keto restaurants are rare in NYC, but many health food restaurants and cafes explicitly offer keto menu sections or keto-labeled dishes.' },
      { question: 'What should I look for in a keto-friendly restaurant?', answer: 'Look for restaurants that clearly label macronutrients, offer low-carb substitutions, and feature protein and fat-focused dishes on their menu.' },
      { question: 'Is eating keto in NYC expensive?', answer: 'Keto eating in NYC can be moderate to expensive due to the emphasis on quality proteins, but many affordable options exist at Greek, Mediterranean, and American restaurants.' },
    ]
  },
  'paleo': {
    label: 'Paleo',
    emoji: '🍖',
    intro: 'The paleo diet focuses on whole, unprocessed foods that our ancestors would have eaten — and NYC\'s farm-to-table and whole food restaurant scene makes it increasingly easy to eat paleo across all five boroughs.',
    whatIs: 'Paleo-friendly restaurants serve food that excludes grains, legumes, dairy, refined sugar, and processed foods, focusing instead on meat, fish, vegetables, fruits, nuts, and seeds. Restaurants tagged paleo explicitly offer paleo menu options.',
    faqs: [
      { question: 'What types of restaurants are best for paleo eating in NYC?', answer: 'Farm-to-table restaurants, whole food cafes, and many health food spots in NYC naturally align with paleo principles in their focus on unprocessed, locally sourced ingredients.' },
      { question: 'Is eating paleo difficult in NYC?', answer: 'NYC\'s strong health food culture and farm-to-table restaurant scene make it one of the easier US cities to eat paleo, particularly in Manhattan and Brooklyn.' },
      { question: 'Can I eat paleo at mainstream NYC restaurants?', answer: 'Many NYC restaurants can accommodate paleo requests by substituting grain-based sides and avoiding dairy and legumes, though dedicated paleo menu options are more common at health food establishments.' },
      { question: 'Are paleo and whole30 the same thing?', answer: 'Paleo and Whole30 are similar but not identical. Whole30 is a stricter 30-day version of paleo. Many restaurants tagged paleo in this directory can accommodate both approaches.' },
      { question: 'Where can I find paleo-friendly restaurants in NYC?', answer: 'Manhattan\'s health food districts, particularly in Chelsea, the West Village, and the Upper West Side, have the strongest selection of paleo-friendly restaurants.' },
    ]
  },
  'whole-foods': {
    label: 'Whole Foods',
    emoji: '🥗',
    intro: 'Restaurants focused on whole, minimally processed foods are increasingly common across NYC, driven by a growing awareness of the link between food quality and health. This directory identifies restaurants that prioritize unprocessed, nutrient-dense ingredients in their cooking.',
    whatIs: 'Whole foods restaurants emphasize unprocessed or minimally processed ingredients — real vegetables, whole grains, legumes, and quality proteins — over refined or heavily processed foods. These restaurants typically offer transparent ingredient sourcing and preparation methods.',
    faqs: [
      { question: 'What does whole foods mean in the context of a restaurant?', answer: 'A whole foods restaurant emphasizes unprocessed, minimally refined ingredients — fresh vegetables, whole grains, quality proteins, and natural fats — over processed or artificial ingredients.' },
      { question: 'Are whole foods restaurants the same as health food restaurants?', answer: 'There is significant overlap. Health food restaurants and whole foods restaurants share an emphasis on nutritious, high-quality ingredients, though whole foods restaurants specifically focus on minimizing food processing.' },
      { question: 'Is eating at whole foods restaurants more expensive?', answer: 'Whole foods restaurants typically cost more than fast food but are comparable to or only slightly more expensive than mid-range NYC restaurants, reflecting the higher quality of their ingredients.' },
      { question: 'Which boroughs have the most whole foods restaurants?', answer: 'Manhattan and Brooklyn have the highest concentrations of whole foods focused restaurants, particularly in neighborhoods like the West Village, Chelsea, Park Slope, and Williamsburg.' },
      { question: 'Are whole foods restaurants good for weight management?', answer: 'Many nutritionists recommend whole foods diets for weight management due to their emphasis on fiber-rich, nutrient-dense foods that promote satiety without excess calories.' },
    ]
  },
  'low-calorie': {
    label: 'Low Calorie',
    emoji: '⚖️',
    intro: 'For diners counting calories or following a calorie-conscious eating plan, NYC offers a growing number of restaurants that explicitly display calorie counts, offer portion-controlled meals, or specialize in light, nutritious dishes designed to support weight management goals.',
    whatIs: 'Restaurants tagged low-calorie in this directory explicitly market calorie-counted menu options, display calorie information, or specialize in lighter, portion-controlled dishes. NYC requires chain restaurants with 15+ locations to display calorie counts by law.',
    faqs: [
      { question: 'Are calorie counts required on menus in NYC?', answer: 'Yes — NYC requires chain restaurants with 15 or more US locations to display calorie counts on menus. This makes it easier to make informed choices at chain health food and fast-casual restaurants.' },
      { question: 'Which NYC restaurants are best for low-calorie eating?', answer: 'Salad-focused chains, poke bowl restaurants, and many health food cafes explicitly offer low-calorie options with transparent nutritional information.' },
      { question: 'Can I eat low-calorie at any NYC restaurant?', answer: 'Most NYC restaurants can accommodate lower-calorie requests by adjusting portions, substituting sides, or modifying preparation methods. Restaurants tagged low-calorie specifically cater to this need.' },
      { question: 'Are there low-calorie healthy options that are also filling?', answer: 'Yes — many low-calorie restaurants in NYC focus on high-volume, high-fiber foods like salads, soups, and grain bowls that are satisfying despite being lower in calories.' },
      { question: 'What are the best low-calorie cuisine types in NYC?', answer: 'Japanese, Vietnamese, and many Mediterranean cuisines naturally offer lower-calorie options with their emphasis on fresh vegetables, lean proteins, and light preparations.' },
    ]
  },
  'raw-food': {
    label: 'Raw Food',
    emoji: '🌿',
    intro: 'NYC\'s raw food restaurant scene, while niche, includes some of the most creative and committed health food establishments in the city — restaurants that serve food prepared without heat above 118°F to preserve natural enzymes and nutrients.',
    whatIs: 'Raw food restaurants serve food that has not been heated above 118°F (48°C), based on the belief that cooking destroys natural enzymes and reduces nutritional value. Menus typically feature raw fruits and vegetables, nuts, seeds, sprouted grains, and fermented foods.',
    faqs: [
      { question: 'Are raw food restaurants only for vegans?', answer: 'Raw food restaurants are predominantly vegan, as raw animal products carry significant food safety risks. However, some raw food establishments do serve raw fish preparations like sushi and sashimi.' },
      { question: 'Is raw food safe to eat?', answer: 'Raw food restaurants follow strict food safety protocols to ensure their uncooked foods are safe to consume. If you have immune system concerns, consult your doctor before eating at raw food establishments.' },
      { question: 'What do raw food restaurants typically serve?', answer: 'Expect creative dishes like zucchini noodles, raw nut-based cheeses, dehydrated crackers, fresh juices, smoothies, raw desserts made from dates and nuts, and elaborate salads.' },
      { question: 'Are there raw food restaurants in all NYC boroughs?', answer: 'Raw food restaurants are primarily concentrated in Manhattan and Brooklyn, with the highest density in neighborhoods like the East Village and Williamsburg.' },
      { question: 'Is raw food more expensive than cooked food restaurants?', answer: 'Raw food restaurants are often at the higher end of the price spectrum in NYC due to the quality of ingredients and the time-intensive preparation involved.' },
    ]
  },
  'nut-free': {
    label: 'Nut-Free',
    emoji: '🚫',
    intro: 'For diners with nut allergies, finding safe restaurants in NYC requires careful research. This directory identifies restaurants that explicitly advertise nut-free kitchens or nut-free menu options, helping those with nut allergies dine more safely and confidently.',
    whatIs: 'Restaurants tagged nut-free in this directory explicitly advertise nut-free kitchens or nut-free menu options. Always inform your server about nut allergies and confirm their cross-contamination protocols, as allergy situations can vary.',
    faqs: [
      { question: 'Are there truly nut-free restaurants in NYC?', answer: 'Some NYC restaurants operate completely nut-free kitchens, while others offer designated nut-free menu sections. Always confirm directly with the restaurant about their protocols.' },
      { question: 'Which cuisines are most likely to be nut-free in NYC?', answer: 'Italian, French, and many American restaurants tend to use fewer nuts than Asian and Middle Eastern cuisines. However, always confirm with the specific restaurant.' },
      { question: 'How do I verify a restaurant is safe for severe nut allergies?', answer: 'Always call ahead and speak directly with the chef or manager about your allergy. Ask about cross-contamination risks, shared cooking surfaces, and whether staff are trained in allergy protocols.' },
      { question: 'Are fast food restaurants in NYC safer for nut allergies?', answer: 'Some fast food chains provide detailed allergen information online, but cross-contamination is always a risk. Check each chain\'s official allergen information and consult with staff.' },
      { question: 'What should I tell a restaurant when I have a nut allergy?', answer: 'Clearly state that you have a nut allergy when making a reservation and again when ordering. Specify whether it is a preference or a life-threatening allergy requiring strict protocols.' },
    ]
  }
}
