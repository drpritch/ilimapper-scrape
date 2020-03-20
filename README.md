# ilimapper-scrape
Ontario Influenza-Like Illness data scrape, from http://mapper.kflaphi.ca/ilimapper/analysis

I take no responsibility for the validity of this data, or how it is interpreted. This is simply scraped from the Ontario ministry's website.
The ministry itself has blocked access to the data and maps. There may be a reason for this, such as
uncertainty about the data quality; I can't say.

For those who just want the data:
- fulldata.csv has all of the fields from the original JSON scraped data
- pctresp.csv and respvisits.csv has it organized more cleanly for presentation, as a 2D table of region vs. date.
  PctResp is the percent respiratory visits per day (presumably) and RespVisits has the total respiratory visits by day
- ilimapper.xlsx has the two 2D tables imported into Excel, and a summary graph for the GTHA

For those who want to work with the scripts:
- doit.sh downloads the JSON files from the ilimapper website
- doit.R then processes those JSON files and outputs to the CSVs
