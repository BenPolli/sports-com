/**
 * THE COMPLETE UK FOOTBALL PYRAMID — MASTER STRUCTURE
 *
 * Every league, every division, every category across:
 * - England (Steps 1-11+, Sunday, Junior, Women's, Disability, Schools)
 * - Scotland (SPFL → Juniors)
 * - Wales (Cymru → Grassroots)
 * - Northern Ireland (NIFL → Amateur)
 *
 * Each entry has:
 *   id:       unique key for tracking
 *   league:   official league name
 *   category: Professional | Semi-Pro | Grassroots | Junior | Women | Disability | Soccer School | Walking Football | Futsal | Veterans | University
 *   level:    pyramid step (1 = top)
 *   region:   geographic area
 *   country:  England | Scotland | Wales | Northern Ireland
 *   searches: SERP queries to find all clubs in this league
 *   est:      estimated number of clubs
 */

const STRUCTURE = [

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLAND — PROFESSIONAL (Steps 1-4)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'eng-1-premier-league',
    league: 'Premier League',
    category: 'Professional', level: 1, region: 'England', country: 'England', est: 20,
    searches: [
      'Premier League 2024-25 clubs teams complete list',
      'site:premierleague.com clubs',
    ]
  },
  {
    id: 'eng-2-championship',
    league: 'EFL Championship',
    category: 'Professional', level: 2, region: 'England', country: 'England', est: 24,
    searches: [
      'EFL Championship 2024-25 all clubs teams list',
      'site:efl.com championship clubs',
    ]
  },
  {
    id: 'eng-3-league-one',
    league: 'EFL League One',
    category: 'Professional', level: 3, region: 'England', country: 'England', est: 24,
    searches: [
      'EFL League One 2024-25 all clubs teams list',
      'site:efl.com league-one clubs',
    ]
  },
  {
    id: 'eng-4-league-two',
    league: 'EFL League Two',
    category: 'Professional', level: 4, region: 'England', country: 'England', est: 24,
    searches: [
      'EFL League Two 2024-25 all clubs teams list',
      'site:efl.com league-two clubs',
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLAND — NATIONAL LEAGUE SYSTEM (Step 5-6)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'eng-5-national-league',
    league: 'National League',
    category: 'Semi-Pro', level: 5, region: 'England', country: 'England', est: 24,
    searches: [
      'National League 2024-25 all clubs teams list',
      'National League Step 1 non-league clubs complete list',
    ]
  },
  {
    id: 'eng-6-national-league-north',
    league: 'National League North',
    category: 'Semi-Pro', level: 6, region: 'North', country: 'England', est: 24,
    searches: ['National League North 2024-25 clubs teams list']
  },
  {
    id: 'eng-6-national-league-south',
    league: 'National League South',
    category: 'Semi-Pro', level: 6, region: 'South', country: 'England', est: 24,
    searches: ['National League South 2024-25 clubs teams list']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLAND — STEPS 3-4 (Level 7-8 in pyramid)
  // ═══════════════════════════════════════════════════════════════════════════

  // Step 3
  {
    id: 'eng-7-northern-premier-prem',
    league: 'Northern Premier League Premier Division',
    category: 'Semi-Pro', level: 7, region: 'North', country: 'England', est: 22,
    searches: ['Northern Premier League Premier Division 2024-25 clubs list']
  },
  {
    id: 'eng-7-southern-premier-south',
    league: 'Southern League Premier Division South',
    category: 'Semi-Pro', level: 7, region: 'South', country: 'England', est: 22,
    searches: ['Southern League Premier Division South 2024-25 clubs list']
  },
  {
    id: 'eng-7-southern-premier-central',
    league: 'Southern League Premier Division Central',
    category: 'Semi-Pro', level: 7, region: 'Midlands', country: 'England', est: 22,
    searches: ['Southern League Premier Division Central 2024-25 clubs list']
  },
  {
    id: 'eng-7-isthmian-premier',
    league: 'Isthmian League Premier Division',
    category: 'Semi-Pro', level: 7, region: 'South East', country: 'England', est: 22,
    searches: ['Isthmian League Premier Division 2024-25 clubs list']
  },

  // Step 4
  {
    id: 'eng-8-npl-east',
    league: 'Northern Premier League Division One East',
    category: 'Semi-Pro', level: 8, region: 'North East', country: 'England', est: 20,
    searches: ['Northern Premier League Division One East clubs list']
  },
  {
    id: 'eng-8-npl-west',
    league: 'Northern Premier League Division One West',
    category: 'Semi-Pro', level: 8, region: 'North West', country: 'England', est: 20,
    searches: ['Northern Premier League Division One West clubs list']
  },
  {
    id: 'eng-8-npl-midlands',
    league: 'Northern Premier League Division One Midlands',
    category: 'Semi-Pro', level: 8, region: 'Midlands', country: 'England', est: 20,
    searches: ['Northern Premier League Division One Midlands clubs list']
  },
  {
    id: 'eng-8-southern-central',
    league: 'Southern League Division One Central',
    category: 'Semi-Pro', level: 8, region: 'Midlands', country: 'England', est: 20,
    searches: ['Southern League Division One Central clubs list']
  },
  {
    id: 'eng-8-southern-south',
    league: 'Southern League Division One South',
    category: 'Semi-Pro', level: 8, region: 'South', country: 'England', est: 20,
    searches: ['Southern League Division One South clubs list']
  },
  {
    id: 'eng-8-isthmian-north',
    league: 'Isthmian League Division One North',
    category: 'Semi-Pro', level: 8, region: 'North London', country: 'England', est: 20,
    searches: ['Isthmian League Division One North clubs list']
  },
  {
    id: 'eng-8-isthmian-south-central',
    league: 'Isthmian League Division One South Central',
    category: 'Semi-Pro', level: 8, region: 'South', country: 'England', est: 20,
    searches: ['Isthmian League Division One South Central clubs list']
  },
  {
    id: 'eng-8-isthmian-south-east',
    league: 'Isthmian League Division One South East',
    category: 'Semi-Pro', level: 8, region: 'South East', country: 'England', est: 20,
    searches: ['Isthmian League Division One South East clubs list']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLAND — STEPS 5-6 (Level 9-10)
  // ═══════════════════════════════════════════════════════════════════════════

  // Each of these has a Premier + Division One (or more)
  ...[
    { name: 'Combined Counties League', region: 'South', divs: ['Premier Division', 'Division One'] },
    { name: 'Eastern Counties League', region: 'East', divs: ['Premier Division', 'Division One North', 'Division One South'] },
    { name: 'Essex Senior League', region: 'East', divs: ['Premier Division'] },
    { name: 'Hellenic League', region: 'South West', divs: ['Premier Division', 'Division One'] },
    { name: 'Midland Football League', region: 'Midlands', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'North West Counties League', region: 'North West', divs: ['Premier Division', 'Division One North', 'Division One South'] },
    { name: 'Northern Counties East League', region: 'North East', divs: ['Premier Division', 'Division One'] },
    { name: 'Northern League', region: 'North East', divs: ['Division One', 'Division Two'] },
    { name: 'South West Peninsula League', region: 'South West', divs: ['Premier Division East', 'Premier Division West', 'Division One East', 'Division One West'] },
    { name: 'Southern Combination League', region: 'South', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Spartan South Midlands League', region: 'South Midlands', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'United Counties League', region: 'Midlands', divs: ['Premier Division North', 'Premier Division South', 'Division One'] },
    { name: 'Wessex League', region: 'South', divs: ['Premier Division', 'Division One'] },
    { name: 'Western League', region: 'South West', divs: ['Premier Division', 'Division One'] },
    { name: 'West Midlands Regional League', region: 'West Midlands', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Anglian Combination', region: 'East', divs: ['Premier Division', 'Division One', 'Division Two', 'Division Three', 'Division Four', 'Division Five'] },
    { name: 'Cambridgeshire County League', region: 'East', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Central Midlands League', region: 'Midlands', divs: ['Premier Division North', 'Premier Division South'] },
    { name: 'Dorset Premier League', region: 'South West', divs: ['Premier Division'] },
    { name: 'East Berkshire League', region: 'South', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Hampshire League', region: 'South', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Herts Senior County League', region: 'South', divs: ['Premier Division', 'Division One'] },
    { name: 'Kent County League', region: 'South East', divs: ['Premier Division', 'Division One West', 'Division One East', 'Division Two West', 'Division Two East', 'Division Three West', 'Division Three East'] },
    { name: 'Lancashire Amateur League', region: 'North West', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Leicestershire Senior League', region: 'Midlands', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Liverpool County Premier League', region: 'North West', divs: ['Premier Division', 'Division One'] },
    { name: 'Manchester League', region: 'North West', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Middlesex County League', region: 'London', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Mid Sussex League', region: 'South', divs: ['Premier Division', 'Division One', 'Division Two', 'Division Three'] },
    { name: 'North Berkshire League', region: 'South', divs: ['Division One', 'Division Two', 'Division Three'] },
    { name: 'Northamptonshire Combination', region: 'Midlands', divs: ['Premier Division', 'Division One', 'Division Two', 'Division Three'] },
    { name: 'Nottinghamshire Senior League', region: 'Midlands', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Oxfordshire Senior League', region: 'South', divs: ['Premier Division', 'Division One'] },
    { name: 'Peterborough & District League', region: 'East', divs: ['Premier Division', 'Division One', 'Division Two', 'Division Three', 'Division Four'] },
    { name: 'Reading League', region: 'South', divs: ['Premier Division', 'Division One', 'Division Two', 'Division Three', 'Division Four'] },
    { name: 'Sheffield & District Senior League', region: 'North', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Somerset County League', region: 'South West', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Staffordshire County Senior League', region: 'Midlands', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Suffolk & Ipswich League', region: 'East', divs: ['Senior Division', 'Division One', 'Division Two', 'Division Three', 'Division Four', 'Division Five'] },
    { name: 'Surrey Elite Intermediate League', region: 'South', divs: ['Premier Division', 'Division One'] },
    { name: 'Teesside League', region: 'North East', divs: ['Division One', 'Division Two'] },
    { name: 'Wearside League', region: 'North East', divs: ['Division One', 'Division Two'] },
    { name: 'West Cheshire League', region: 'North West', divs: ['Division One', 'Division Two', 'Division Three'] },
    { name: 'West Lancashire League', region: 'North West', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'West Yorkshire League', region: 'North', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Wiltshire League', region: 'South West', divs: ['Premier Division', 'Division One', 'Division Two'] },
    { name: 'Witham & District League', region: 'East', divs: ['Premier Division', 'Division One'] },
    { name: 'York League', region: 'North', divs: ['Premier Division', 'Division One', 'Division Two', 'Division Three'] },
  ].flatMap(l => l.divs.map((div, i) => ({
    id: `eng-9-${l.name.toLowerCase().replace(/\s+/g, '-')}-${div.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${l.name} ${div}`,
    category: i === 0 ? 'Semi-Pro' : 'Grassroots',
    level: i === 0 ? 9 : 10,
    region: l.region,
    country: 'England',
    est: 18,
    searches: [
      `"${l.name}" "${div}" clubs teams list`,
      `"${l.name}" "${div}" fixtures table 2024-25`,
    ]
  }))),

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLAND — SUNDAY LEAGUES (by major city/area)
  // ═══════════════════════════════════════════════════════════════════════════

  ...['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield',
    'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Brighton',
    'Portsmouth', 'Plymouth', 'Sunderland', 'Wolverhampton', 'Coventry', 'Derby',
    'Stoke-on-Trent', 'Reading', 'Oxford', 'Cambridge', 'Norwich', 'Ipswich',
    'Luton', 'Milton Keynes', 'Northampton', 'Peterborough', 'Swindon',
    'Gloucester', 'Exeter', 'Bournemouth', 'Cheltenham', 'Worcester', 'Hereford',
    'Shrewsbury', 'Chester', 'Blackpool', 'Preston', 'Bolton', 'Wigan',
    'Blackburn', 'Burnley', 'York', 'Hull', 'Doncaster', 'Barnsley',
    'Rotherham', 'Huddersfield', 'Bradford', 'Halifax', 'Wakefield',
    'Middlesbrough', 'Darlington', 'Hartlepool', 'Carlisle', 'Scarborough',
    'Grimsby', 'Lincoln', 'Mansfield', 'Chesterfield', 'Crewe', 'Stockport',
    'Oldham', 'Rochdale', 'Salford', 'Warrington', 'Colchester', 'Chelmsford',
    'Southend', 'Stevenage', 'Watford', 'St Albans', 'High Wycombe', 'Slough',
    'Basingstoke', 'Salisbury', 'Taunton', 'Yeovil', 'Torquay', 'Truro',
    'Crawley', 'Hastings', 'Worthing', 'Guildford', 'Maidstone', 'Canterbury',
    'Ashford', 'Medway', 'Thanet'
  ].map(city => ({
    id: `eng-sunday-${city.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${city} Sunday League`,
    category: 'Grassroots', level: 12, region: city, country: 'England', est: 30,
    searches: [
      `"${city}" sunday league football clubs teams`,
      `"${city}" sunday football league fixtures teams list`,
    ]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // SCOTLAND
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'sco-1-prem', league: 'Scottish Premiership', category: 'Professional', level: 1, region: 'Scotland', country: 'Scotland', est: 12, searches: ['Scottish Premiership 2024-25 clubs list'] },
  { id: 'sco-2-champ', league: 'Scottish Championship', category: 'Professional', level: 2, region: 'Scotland', country: 'Scotland', est: 10, searches: ['Scottish Championship 2024-25 clubs list'] },
  { id: 'sco-3-l1', league: 'Scottish League One', category: 'Professional', level: 3, region: 'Scotland', country: 'Scotland', est: 10, searches: ['Scottish League One 2024-25 clubs list'] },
  { id: 'sco-4-l2', league: 'Scottish League Two', category: 'Professional', level: 4, region: 'Scotland', country: 'Scotland', est: 10, searches: ['Scottish League Two 2024-25 clubs list'] },
  { id: 'sco-5-highland', league: 'Highland Football League', category: 'Semi-Pro', level: 5, region: 'Scotland', country: 'Scotland', est: 18, searches: ['Highland Football League clubs list'] },
  { id: 'sco-5-lowland', league: 'Lowland Football League', category: 'Semi-Pro', level: 5, region: 'Scotland', country: 'Scotland', est: 18, searches: ['Lowland Football League clubs list'] },
  { id: 'sco-6-eos-prem', league: 'East of Scotland League Premier Division', category: 'Semi-Pro', level: 6, region: 'Scotland', country: 'Scotland', est: 16, searches: ['East of Scotland Football League Premier Division clubs'] },
  { id: 'sco-6-eos-1', league: 'East of Scotland League First Division', category: 'Grassroots', level: 7, region: 'Scotland', country: 'Scotland', est: 16, searches: ['East of Scotland Football League First Division clubs'] },
  { id: 'sco-6-eos-2', league: 'East of Scotland League Second Division', category: 'Grassroots', level: 8, region: 'Scotland', country: 'Scotland', est: 14, searches: ['East of Scotland Football League Second Division clubs'] },
  { id: 'sco-6-wos-prem', league: 'West of Scotland League Premier Division', category: 'Semi-Pro', level: 6, region: 'Scotland', country: 'Scotland', est: 16, searches: ['West of Scotland Football League Premier Division clubs'] },
  { id: 'sco-6-wos-1', league: 'West of Scotland League First Division', category: 'Grassroots', level: 7, region: 'Scotland', country: 'Scotland', est: 16, searches: ['West of Scotland Football League First Division clubs'] },
  { id: 'sco-6-wos-2', league: 'West of Scotland League Second Division', category: 'Grassroots', level: 8, region: 'Scotland', country: 'Scotland', est: 16, searches: ['West of Scotland Football League Second Division clubs'] },
  { id: 'sco-6-wos-3', league: 'West of Scotland League Third Division', category: 'Grassroots', level: 9, region: 'Scotland', country: 'Scotland', est: 14, searches: ['West of Scotland Football League Third Division clubs'] },
  { id: 'sco-6-sos', league: 'South of Scotland League', category: 'Semi-Pro', level: 6, region: 'Scotland', country: 'Scotland', est: 12, searches: ['South of Scotland Football League clubs'] },
  { id: 'sco-7-ncal', league: 'North Caledonian League', category: 'Grassroots', level: 7, region: 'Scotland', country: 'Scotland', est: 12, searches: ['North Caledonian Football League clubs list'] },
  // Scottish amateur/Sunday
  ...['Glasgow', 'Edinburgh', 'Dundee', 'Aberdeen', 'Inverness', 'Stirling', 'Perth', 'Kilmarnock', 'Ayr', 'Dumfries', 'Falkirk', 'Dunfermline', 'Paisley', 'Hamilton', 'Motherwell', 'Greenock', 'Clydebank', 'Airdrie', 'East Kilbride', 'Livingston'].map(city => ({
    id: `sco-amateur-${city.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${city} Amateur Football`,
    category: 'Grassroots', level: 10, region: city, country: 'Scotland', est: 15,
    searches: [`"${city}" amateur football clubs teams league list Scotland`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // WALES
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'wal-1-cymru-prem', league: 'Cymru Premier', category: 'Professional', level: 1, region: 'Wales', country: 'Wales', est: 12, searches: ['Cymru Premier 2024-25 clubs list'] },
  { id: 'wal-2-cymru-north', league: 'Cymru North', category: 'Semi-Pro', level: 2, region: 'North Wales', country: 'Wales', est: 16, searches: ['Cymru North 2024-25 clubs list'] },
  { id: 'wal-2-cymru-south', league: 'Cymru South', category: 'Semi-Pro', level: 2, region: 'South Wales', country: 'Wales', est: 16, searches: ['Cymru South 2024-25 clubs list'] },
  { id: 'wal-3-wfl-1', league: 'Welsh Football League Division One', category: 'Semi-Pro', level: 3, region: 'Wales', country: 'Wales', est: 16, searches: ['Welsh Football League Division One clubs'] },
  { id: 'wal-3-wfl-2', league: 'Welsh Football League Division Two', category: 'Semi-Pro', level: 3, region: 'Wales', country: 'Wales', est: 16, searches: ['Welsh Football League Division Two clubs'] },
  { id: 'wal-3-wfl-3', league: 'Welsh Football League Division Three', category: 'Grassroots', level: 4, region: 'Wales', country: 'Wales', est: 16, searches: ['Welsh Football League Division Three clubs'] },
  { id: 'wal-4-wnl', league: 'Welsh National League', category: 'Grassroots', level: 4, region: 'Wales', country: 'Wales', est: 40, searches: ['Welsh National League football clubs list all divisions'] },
  // Welsh area leagues
  ...['Gwent', 'South Wales', 'West Wales', 'North Wales', 'Mid Wales', 'Neath', 'Swansea', 'Carmarthenshire', 'Pembrokeshire', 'Ceredigion', 'Anglesey', 'Gwynedd', 'Denbighshire', 'Wrexham', 'Flintshire'].map(area => ({
    id: `wal-local-${area.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${area} Football League`,
    category: 'Grassroots', level: 5, region: area, country: 'Wales', est: 20,
    searches: [`"${area}" football league clubs teams list Wales`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // NORTHERN IRELAND
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'ni-1-prem', league: 'NIFL Premiership', category: 'Professional', level: 1, region: 'Northern Ireland', country: 'Northern Ireland', est: 12, searches: ['NIFL Premiership 2024-25 clubs list Northern Ireland'] },
  { id: 'ni-2-champ', league: 'NIFL Championship', category: 'Semi-Pro', level: 2, region: 'Northern Ireland', country: 'Northern Ireland', est: 12, searches: ['NIFL Championship clubs list Northern Ireland'] },
  { id: 'ni-3-pil', league: 'NIFL Premier Intermediate League', category: 'Semi-Pro', level: 3, region: 'Northern Ireland', country: 'Northern Ireland', est: 16, searches: ['NIFL Premier Intermediate League clubs'] },
  { id: 'ni-4-amateur', league: 'Northern Ireland Intermediate League', category: 'Grassroots', level: 4, region: 'Northern Ireland', country: 'Northern Ireland', est: 20, searches: ['Northern Ireland Intermediate League football clubs'] },
  { id: 'ni-5-amateur-1', league: 'Northern Ireland Amateur League', category: 'Grassroots', level: 5, region: 'Northern Ireland', country: 'Northern Ireland', est: 40, searches: ['Northern Ireland amateur football league clubs all divisions'] },
  ...['Belfast', 'Derry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon', 'Ballymena', 'Coleraine', 'Omagh', 'Enniskillen', 'Dungannon', 'Larne', 'Carrickfergus', 'Antrim', 'Strabane'].map(city => ({
    id: `ni-local-${city.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${city} & District Football`,
    category: 'Grassroots', level: 6, region: city, country: 'Northern Ireland', est: 10,
    searches: [`"${city}" football clubs teams list Northern Ireland`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // WOMEN'S FOOTBALL — ALL LEVELS
  // ═══════════════════════════════════════════════════════════════════════════

  // England Women's
  { id: 'wom-1-wsl', league: "Women's Super League", category: 'Women', level: 1, region: 'England', country: 'England', est: 12, searches: ["Women's Super League WSL 2024-25 clubs list"] },
  { id: 'wom-2-wc', league: "Women's Championship", category: 'Women', level: 2, region: 'England', country: 'England', est: 12, searches: ["FA Women's Championship 2024-25 clubs list"] },
  { id: 'wom-3-wnl-north', league: "Women's National League Div 1 North", category: 'Women', level: 3, region: 'North', country: 'England', est: 14, searches: ["FA Women's National League Division One North clubs"] },
  { id: 'wom-3-wnl-south', league: "Women's National League Div 1 South", category: 'Women', level: 3, region: 'South', country: 'England', est: 14, searches: ["FA Women's National League Division One South clubs"] },
  { id: 'wom-4-wnl-d2-north', league: "Women's National League Div 2 North", category: 'Women', level: 4, region: 'North', country: 'England', est: 14, searches: ["FA Women's National League Division Two North clubs"] },
  { id: 'wom-4-wnl-d2-se', league: "Women's National League Div 2 South East", category: 'Women', level: 4, region: 'South East', country: 'England', est: 14, searches: ["FA Women's National League Division Two South East clubs"] },
  { id: 'wom-4-wnl-d2-sw', league: "Women's National League Div 2 South West", category: 'Women', level: 4, region: 'South West', country: 'England', est: 14, searches: ["FA Women's National League Division Two South West clubs"] },
  { id: 'wom-4-wnl-d2-mid', league: "Women's National League Div 2 Midlands", category: 'Women', level: 4, region: 'Midlands', country: 'England', est: 14, searches: ["FA Women's National League Division Two Midlands clubs"] },

  // Women's county leagues (this is where the volume is ~3000+ clubs)
  ...['Bedfordshire', 'Berkshire', 'Birmingham', 'Buckinghamshire', 'Cambridgeshire',
    'Cheshire', 'Cornwall', 'Cumberland', 'Derbyshire', 'Devon', 'Dorset', 'Durham',
    'East Riding', 'Essex', 'Gloucestershire', 'Hampshire', 'Herefordshire',
    'Hertfordshire', 'Huntingdonshire', 'Kent', 'Lancashire', 'Leicestershire',
    'Lincolnshire', 'Liverpool', 'London', 'Manchester', 'Middlesex', 'Norfolk',
    'Northamptonshire', 'Northumberland', 'Nottinghamshire', 'Oxfordshire',
    'Sheffield', 'Shropshire', 'Somerset', 'Staffordshire', 'Suffolk', 'Surrey',
    'Sussex', 'Wiltshire', 'Worcestershire', 'West Riding', 'North Riding'
  ].map(county => ({
    id: `wom-county-${county.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${county} Women's Football League`,
    category: 'Women', level: 6, region: county, country: 'England', est: 30,
    searches: [
      `"${county}" women's football league clubs teams list`,
      `"${county}" ladies football league clubs teams`,
    ]
  })),

  // Scotland, Wales, NI Women's
  { id: 'wom-sco-swpl1', league: "SWPL 1", category: 'Women', level: 1, region: 'Scotland', country: 'Scotland', est: 12, searches: ["SWPL 1 Scottish Women's Premier League clubs"] },
  { id: 'wom-sco-swpl2', league: "SWPL 2", category: 'Women', level: 2, region: 'Scotland', country: 'Scotland', est: 12, searches: ["SWPL 2 Scottish Women's Premier League 2 clubs"] },
  { id: 'wom-sco-swf', league: "Scottish Women's Football League", category: 'Women', level: 3, region: 'Scotland', country: 'Scotland', est: 40, searches: ["Scottish Women's Football League all divisions clubs"] },
  { id: 'wom-wal', league: "Adran Premier", category: 'Women', level: 1, region: 'Wales', country: 'Wales', est: 10, searches: ["Adran Premier Welsh Women's football clubs list"] },
  { id: 'wom-wal-2', league: "Adran North & South", category: 'Women', level: 2, region: 'Wales', country: 'Wales', est: 20, searches: ["Adran North Adran South Welsh Women's football clubs"] },
  { id: 'wom-ni', league: "NIFL Women's Premiership", category: 'Women', level: 1, region: 'Northern Ireland', country: 'Northern Ireland', est: 10, searches: ["NIFL Women's Premiership Northern Ireland clubs"] },
  { id: 'wom-ni-champ', league: "NIFL Women's Championship", category: 'Women', level: 2, region: 'Northern Ireland', country: 'Northern Ireland', est: 12, searches: ["Northern Ireland Women's Championship football clubs"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // JUNIOR / YOUTH FOOTBALL — ALL 43 COUNTY FAs
  // ═══════════════════════════════════════════════════════════════════════════

  // FA academies (Category 1-4)
  { id: 'jun-cat1', league: 'Category 1 Academies', category: 'Junior', level: 1, region: 'England', country: 'England', est: 24, searches: ['Premier League Category 1 academy clubs list all'] },
  { id: 'jun-cat2', league: 'Category 2 Academies', category: 'Junior', level: 2, region: 'England', country: 'England', est: 24, searches: ['EFL Category 2 academy clubs list all'] },
  { id: 'jun-cat3', league: 'Category 3 Academies', category: 'Junior', level: 3, region: 'England', country: 'England', est: 30, searches: ['Category 3 football academy clubs list England'] },
  { id: 'jun-cat4', league: 'Category 4 Academies', category: 'Junior', level: 4, region: 'England', country: 'England', est: 20, searches: ['Category 4 football academy clubs list England'] },

  // County FA junior leagues — THIS IS WHERE 19,000+ CLUBS ARE
  ...['Bedfordshire', 'Berkshire', 'Birmingham', 'Buckinghamshire', 'Cambridgeshire',
    'Cheshire', 'Cornwall', 'Cumberland', 'Derbyshire', 'Devon', 'Dorset', 'Durham',
    'East Riding', 'Essex', 'Gloucestershire', 'Hampshire', 'Herefordshire',
    'Hertfordshire', 'Huntingdonshire', 'Kent', 'Lancashire', 'Leicestershire',
    'Lincolnshire', 'Liverpool', 'London', 'Manchester', 'Middlesex', 'Norfolk',
    'Northamptonshire', 'Northumberland', 'North Riding', 'Nottinghamshire',
    'Oxfordshire', 'Sheffield', 'Shropshire', 'Somerset', 'Staffordshire', 'Suffolk',
    'Surrey', 'Sussex', 'Westmorland', 'Wiltshire', 'Worcestershire', 'West Riding'
  ].flatMap(county => [
    {
      id: `jun-${county.toLowerCase().replace(/\s+/g, '-')}-youth`,
      league: `${county} FA Youth League`,
      category: 'Junior', level: 5, region: county, country: 'England', est: 200,
      searches: [
        `"${county}" FA youth junior football clubs teams list`,
        `"${county}" youth football league clubs all divisions`,
        `site:fulltime.thefa.com "${county}" youth`,
      ]
    },
    {
      id: `jun-${county.toLowerCase().replace(/\s+/g, '-')}-mini`,
      league: `${county} FA Mini Soccer`,
      category: 'Junior', level: 6, region: county, country: 'England', est: 150,
      searches: [
        `"${county}" mini soccer football clubs teams list`,
        `"${county}" under 7 under 8 under 9 football clubs list`,
      ]
    },
    {
      id: `jun-${county.toLowerCase().replace(/\s+/g, '-')}-girls`,
      league: `${county} FA Girls League`,
      category: 'Junior', level: 5, region: county, country: 'England', est: 80,
      searches: [
        `"${county}" girls youth football clubs teams list`,
        `"${county}" FA girls league clubs`,
      ]
    },
  ]),

  // Scotland junior
  ...['Glasgow', 'Edinburgh', 'Dundee', 'Aberdeen', 'Inverness', 'Fife', 'Ayrshire', 'Lanarkshire', 'Renfrewshire', 'Stirlingshire', 'Perthshire', 'Angus', 'Borders', 'Dumfries & Galloway', 'Highlands'].map(area => ({
    id: `jun-sco-${area.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${area} Youth Football`,
    category: 'Junior', level: 5, region: area, country: 'Scotland', est: 50,
    searches: [`"${area}" youth junior football clubs teams Scotland list`]
  })),

  // Wales junior
  ...['South Wales', 'North Wales', 'West Wales', 'Mid Wales', 'Gwent', 'Cardiff', 'Swansea', 'Newport', 'Wrexham'].map(area => ({
    id: `jun-wal-${area.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${area} Youth Football`,
    category: 'Junior', level: 5, region: area, country: 'Wales', est: 40,
    searches: [`"${area}" youth junior football clubs teams Wales list`]
  })),

  // NI junior
  ...['Belfast', 'Derry', 'Antrim', 'Down', 'Tyrone', 'Armagh', 'Fermanagh'].map(area => ({
    id: `jun-ni-${area.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${area} Youth Football`,
    category: 'Junior', level: 5, region: area, country: 'Northern Ireland', est: 30,
    searches: [`"${area}" youth junior football clubs Northern Ireland list`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // DISABILITY FOOTBALL — ALL TYPES
  // ═══════════════════════════════════════════════════════════════════════════

  ...[
    { type: 'Powerchair Football', search: 'powerchair football clubs UK list all teams' },
    { type: 'Blind Football', search: 'blind football clubs UK England list' },
    { type: 'Deaf Football', search: 'deaf football clubs UK England list all' },
    { type: 'Cerebral Palsy Football', search: 'cerebral palsy CP football clubs UK list' },
    { type: 'Amputee Football', search: 'amputee football clubs UK England list all' },
    { type: 'Frame Football', search: 'frame football clubs UK England list' },
    { type: 'Down Syndrome Football', search: "down's syndrome football clubs UK list" },
    { type: 'Learning Disability Football', search: 'learning disability football clubs UK England list' },
    { type: 'Mental Health Football', search: 'mental health football clubs league UK list' },
    { type: 'Wheelchair Football', search: 'wheelchair football clubs UK list' },
    { type: 'Pan-Disability Football', search: 'pan disability inclusive football clubs UK all' },
    { type: 'Partially Sighted Football', search: 'partially sighted visually impaired football clubs UK' },
  ].map(d => ({
    id: `dis-${d.type.toLowerCase().replace(/\s+/g, '-')}`,
    league: d.type,
    category: 'Disability', level: 1, region: 'UK', country: 'England', est: 20,
    searches: [d.search, `${d.type} league fixtures teams clubs list`]
  })),

  // Regional disability
  ...['North West', 'North East', 'Yorkshire', 'East Midlands', 'West Midlands', 'East', 'London', 'South East', 'South West', 'Scotland', 'Wales', 'Northern Ireland'].map(region => ({
    id: `dis-regional-${region.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${region} Disability Football`,
    category: 'Disability', level: 2, region: region, country: region === 'Scotland' ? 'Scotland' : region === 'Wales' ? 'Wales' : region === 'Northern Ireland' ? 'Northern Ireland' : 'England', est: 15,
    searches: [`"${region}" disability football clubs teams list`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCCER SCHOOLS & ACADEMIES
  // ═══════════════════════════════════════════════════════════════════════════

  ...['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield',
    'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Brighton',
    'Portsmouth', 'Plymouth', 'Sunderland', 'Wolverhampton', 'Coventry', 'Derby',
    'Stoke-on-Trent', 'Reading', 'Oxford', 'Cambridge', 'Norwich', 'Ipswich',
    'Luton', 'Milton Keynes', 'Northampton', 'Peterborough', 'Swindon', 'Exeter',
    'Bournemouth', 'Cheltenham', 'Worcester', 'Chester', 'Blackpool', 'Preston',
    'Bolton', 'York', 'Hull', 'Middlesbrough', 'Carlisle', 'Lincoln',
    'Colchester', 'Chelmsford', 'Southend', 'Watford', 'St Albans',
    'Basingstoke', 'Salisbury', 'Taunton', 'Torquay', 'Truro',
    'Crawley', 'Guildford', 'Maidstone', 'Canterbury',
    'Glasgow', 'Edinburgh', 'Dundee', 'Aberdeen', 'Inverness',
    'Cardiff', 'Swansea', 'Newport', 'Wrexham',
    'Belfast', 'Derry', 'Lisburn'
  ].map(city => ({
    id: `school-${city.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${city} Soccer Schools`,
    category: 'Soccer School', level: 0, region: city,
    country: ['Glasgow','Edinburgh','Dundee','Aberdeen','Inverness'].includes(city) ? 'Scotland' :
             ['Cardiff','Swansea','Newport','Wrexham'].includes(city) ? 'Wales' :
             ['Belfast','Derry','Lisburn'].includes(city) ? 'Northern Ireland' : 'England',
    est: 20,
    searches: [
      `"${city}" soccer school football academy children coaching`,
      `"${city}" football coaching kids junior academy near me`,
    ]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // WALKING FOOTBALL
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'walk-wfa', league: 'Walking Football Association', category: 'Walking Football', level: 1, region: 'England', country: 'England', est: 50, searches: ['Walking Football Association clubs list all UK', 'walking football clubs near me UK list all'] },
  ...['North West', 'North East', 'Yorkshire', 'East Midlands', 'West Midlands', 'East', 'London', 'South East', 'South West', 'Scotland', 'Wales', 'Northern Ireland'].map(region => ({
    id: `walk-${region.toLowerCase().replace(/\s+/g, '-')}`,
    league: `${region} Walking Football`,
    category: 'Walking Football', level: 2, region: region,
    country: region === 'Scotland' ? 'Scotland' : region === 'Wales' ? 'Wales' : region === 'Northern Ireland' ? 'Northern Ireland' : 'England',
    est: 20,
    searches: [`"${region}" walking football clubs list over 50 over 60`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // FUTSAL
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'futsal-nfs', league: 'National Futsal Series', category: 'Futsal', level: 1, region: 'England', country: 'England', est: 20, searches: ['National Futsal Series clubs teams list all'] },
  { id: 'futsal-fa', league: 'FA Futsal Leagues', category: 'Futsal', level: 2, region: 'England', country: 'England', est: 30, searches: ['FA Futsal League clubs teams England all'] },
  { id: 'futsal-sco', league: 'Scottish Futsal League', category: 'Futsal', level: 1, region: 'Scotland', country: 'Scotland', est: 10, searches: ['Scottish Futsal League clubs teams'] },
  ...['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Brighton', 'Glasgow', 'Edinburgh', 'Cardiff'].map(city => ({
    id: `futsal-${city.toLowerCase()}`,
    league: `${city} Futsal`,
    category: 'Futsal', level: 3, region: city,
    country: ['Glasgow','Edinburgh'].includes(city) ? 'Scotland' : city === 'Cardiff' ? 'Wales' : 'England',
    est: 8,
    searches: [`"${city}" futsal club team league`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // VETERANS / OVER 35s
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'vets-national', league: 'Veterans Football UK', category: 'Veterans', level: 1, region: 'England', country: 'England', est: 30, searches: ['veterans over 35 football league clubs UK list all'] },
  ...['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Brighton', 'Glasgow', 'Edinburgh', 'Cardiff', 'Belfast'].map(city => ({
    id: `vets-${city.toLowerCase()}`,
    league: `${city} Veterans Football`,
    category: 'Veterans', level: 2, region: city,
    country: ['Glasgow','Edinburgh'].includes(city) ? 'Scotland' : city === 'Cardiff' ? 'Wales' : city === 'Belfast' ? 'Northern Ireland' : 'England',
    est: 10,
    searches: [`"${city}" veterans over 35 football club team league`]
  })),

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSITY FOOTBALL
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'uni-bucs', league: 'BUCS Football', category: 'University', level: 1, region: 'UK', country: 'England', est: 150,
    searches: [
      'BUCS university football clubs teams list all UK',
      'university football clubs UK complete list BUCS Premier',
      'British Universities football teams all',
    ]
  },
];

module.exports = STRUCTURE;
