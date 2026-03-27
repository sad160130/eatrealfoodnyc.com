export const BOROUGH_MAP: Record<string, string> = {
  'manhattan': 'Manhattan',
  'brooklyn': 'Brooklyn',
  'queens': 'Queens',
  'bronx': 'Bronx',
  'staten-island': 'Staten Island',
}

export const BOROUGH_INTROS: Record<string, string> = {
  'manhattan': 'Manhattan is the heart of NYC\'s healthy dining scene, with an extraordinary density of health-focused restaurants spanning every neighborhood from the farm-to-table hotspots of the West Village to the juice bars and vegan cafes of the Upper West Side. Whether you\'re looking for a quick healthy lunch near Midtown or a dedicated vegan dinner in Chelsea, Manhattan delivers more healthy dining options per square mile than anywhere else in the city.',
  'brooklyn': 'Brooklyn has emerged as NYC\'s most exciting borough for healthy eating, driven by a food culture that prizes locally sourced ingredients, plant-based cooking, and dietary transparency. From the vegan comfort food of Williamsburg to the organic juice bars of Park Slope and the diverse halal and kosher options of Flatbush and Crown Heights, Brooklyn offers a healthy dining scene that is as diverse as its neighborhoods.',
  'queens': 'Queens is NYC\'s most ethnically diverse borough, and that diversity translates directly into one of the city\'s richest selections of naturally healthy cuisines. The Indo-Pakistani restaurants of Jackson Heights, the Greek tavernas of Astoria, and the pan-Asian eateries of Flushing all offer dishes built around fresh vegetables, lean proteins, and whole ingredients — making Queens a paradise for health-conscious diners who value authentic global flavors.',
  'bronx': 'The Bronx is home to a growing healthy dining scene anchored by its vibrant Latin and Caribbean food culture. From the fresh seafood spots of City Island to the plant-forward Dominican and Puerto Rican restaurants of the South Bronx, the borough offers a uniquely flavorful approach to healthy eating that reflects its rich cultural heritage.',
  'staten-island': 'Staten Island\'s healthy restaurant scene reflects the borough\'s suburban character, with a strong selection of family-friendly health-focused restaurants, fresh Italian trattorias emphasizing seasonal ingredients, and a growing number of dedicated health food cafes and juice bars serving the borough\'s health-conscious residents.',
}

export const BOROUGH_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  'manhattan': [
    { question: 'Where are the best healthy restaurants in Manhattan?', answer: 'Manhattan\'s top neighborhoods for healthy eating include the West Village, Chelsea, the Upper West Side, and Flatiron District, all of which have high concentrations of health food restaurants, vegan eateries, and farm-to-table spots.' },
    { question: 'Does Manhattan have good vegan restaurant options?', answer: 'Yes — Manhattan has one of the largest concentrations of vegan restaurants in the world, particularly in neighborhoods like the East Village, Chelsea, and Midtown.' },
    { question: 'Which Manhattan restaurants have an NYC Health Department Grade A?', answer: 'The majority of Manhattan\'s top-rated healthy restaurants hold a Grade A from the NYC Department of Health. Use our Grade A filter to find only Grade A establishments in Manhattan.' },
    { question: 'Are there healthy restaurants open late in Manhattan?', answer: 'Yes, many Manhattan healthy restaurants stay open past 10PM, particularly in Midtown, the East Village, and Hell\'s Kitchen. Check individual restaurant hours on each listing page.' },
    { question: 'What is the average cost of a healthy meal in Manhattan?', answer: 'Healthy restaurants in Manhattan range from budget-friendly options at around $10-15 per person to upscale farm-to-table dining at $40-80 per person. Most mid-range healthy spots fall in the $20-35 range.' },
  ],
  'brooklyn': [
    { question: 'What are the best neighborhoods in Brooklyn for healthy eating?', answer: 'Williamsburg, Park Slope, Carroll Gardens, and Cobble Hill are Brooklyn\'s strongest neighborhoods for healthy dining, with high concentrations of vegan restaurants, organic cafes, and health food spots.' },
    { question: 'Does Brooklyn have good vegan and vegetarian options?', answer: 'Brooklyn is one of the best boroughs in NYC for vegan and vegetarian dining, with a thriving plant-based food scene particularly in Williamsburg and Park Slope.' },
    { question: 'Are there halal healthy restaurants in Brooklyn?', answer: 'Yes — Brooklyn has a large selection of halal restaurants, particularly in neighborhoods like Flatbush, Bay Ridge, and Bensonhurst, many of which offer fresh, health-conscious Middle Eastern and South Asian cuisine.' },
    { question: 'How does Brooklyn compare to Manhattan for healthy eating?', answer: 'Brooklyn often offers better value for healthy dining than Manhattan, with many excellent health food restaurants at lower price points, particularly in neighborhoods like Bushwick and Crown Heights.' },
    { question: 'Are there healthy restaurants near Prospect Park?', answer: 'Yes — Park Slope, which borders Prospect Park, has one of Brooklyn\'s highest concentrations of organic cafes, juice bars, and health food restaurants.' },
  ],
  'queens': [
    { question: 'What makes Queens good for healthy eating?', answer: 'Queens\' extraordinary ethnic diversity means you can find naturally healthy cuisines from dozens of cultures, including Greek, Indian, Korean, Thai, and Middle Eastern restaurants built around fresh whole ingredients.' },
    { question: 'Are there healthy restaurants in Astoria Queens?', answer: 'Yes — Astoria has a strong selection of healthy dining options, particularly Greek and Mediterranean restaurants known for fresh fish, olive oil, and vegetable-forward dishes.' },
    { question: 'Where can I find vegan food in Queens?', answer: 'Jackson Heights, Flushing, and Long Island City have growing vegan and vegetarian restaurant scenes, alongside many vegetarian-friendly Indian and Asian restaurants.' },
    { question: 'Does Queens have restaurants with NYC Health Grade A?', answer: 'Yes — many Queens restaurants hold Grade A from the NYC Department of Health. Use the Grade A filter on this page to see only top-graded establishments.' },
    { question: 'Are there healthy food options in Flushing Queens?', answer: 'Flushing has excellent options for healthy eating, particularly Chinese, Korean, and Taiwanese restaurants offering fresh dim sum, tofu dishes, and vegetable-forward meals.' },
  ],
  'bronx': [
    { question: 'Are there healthy restaurants in the Bronx?', answer: 'Yes — the Bronx has a growing healthy dining scene with strong options for fresh Caribbean, Latin, and soul food cuisines, alongside dedicated health food cafes and juice bars.' },
    { question: 'What types of healthy food is the Bronx known for?', answer: 'The Bronx is particularly known for fresh Dominican, Puerto Rican, and Caribbean food, which often features fresh vegetables, lean proteins, and rice and bean dishes that can be very nutritious.' },
    { question: 'Are there vegan restaurants in the Bronx?', answer: 'The Bronx has a small but growing vegan restaurant scene, with several dedicated plant-based spots particularly in the South Bronx and Fordham areas.' },
    { question: 'Where is City Island and does it have healthy food?', answer: 'City Island is a small island community in the northeast Bronx known for its fresh seafood restaurants, which offer a healthy dining option focused on locally caught fish.' },
    { question: 'How do I find Grade A restaurants in the Bronx?', answer: 'Use the inspection grade filter on this page to view only Bronx restaurants that have received a Grade A from the NYC Department of Health.' },
  ],
  'staten-island': [
    { question: 'Does Staten Island have healthy restaurant options?', answer: 'Yes — Staten Island has a solid selection of healthy restaurants, particularly Italian trattorias emphasizing fresh ingredients, as well as dedicated health food cafes and juice bars.' },
    { question: 'What neighborhoods in Staten Island are best for healthy eating?', answer: 'St. George, New Dorp, and Tottenville have the strongest concentrations of health-conscious restaurants on Staten Island.' },
    { question: 'Are there vegan restaurants on Staten Island?', answer: 'Staten Island has a small but growing selection of vegan-friendly restaurants, though the options are more limited compared to Manhattan and Brooklyn.' },
    { question: 'How do I get to Staten Island restaurants?', answer: 'The Staten Island Ferry from Lower Manhattan is free and connects to the St. George neighborhood, which has several good restaurant options. Many other areas of Staten Island are best reached by car or bus.' },
    { question: 'Does Staten Island have restaurants with good health inspection grades?', answer: 'Yes — many Staten Island restaurants maintain Grade A health inspection ratings. Use the Grade A filter on this page to find top-graded establishments.' },
  ],
}
