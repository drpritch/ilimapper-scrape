library('jsonlite')
phus = c('BCHU','DRHD','GBHU','HNHU','HKPRDHU','HRHD','CHPHS','HPE','HCHU','CKPHS','KFLA','CLCHSD','LGL','MLHU','NPHU','NBPHU','NWHU','COHU','PEEL','PDHU','PCCHU','PHU','RCDHU','EOHU','SMDHU','SWPH','SDHU','TBPHU','THU','WHU','WDGHU','WECHU','YRHU','TOR');
# Exclude two with bad data
phus = c('BCHU','DRHD','GBHU','HNHU','HKPRDHU','HRHD','CHPHS','HPE','CKPHS','KFLA','CLCHSD','LGL','MLHU','NPHU','NBPHU','NWHU','COHU','PEEL','PCCHU','PHU','RCDHU','EOHU','SMDHU','SWPH','SDHU','TBPHU','THU','WHU','WDGHU','WECHU','YRHU','TOR');
data <- fromJSON('APH.json', flatten=TRUE);
data$PHU = 'APH';
for (phu in phus) {
    temp <- fromJSON(paste(phu, '.json', sep=''), flatten=TRUE);
    temp$PHU = phu;
    data <- rbind(data, temp);
}
data$AdmissionDate <- as.Date(data$AdmissionDate);
data$PHU <- as.factor(data$PHU);
data$PctResp <- as.numeric(data$PctResp);

phu_names <- c();
phu_names['APH'] <- 'The District of Algoma Health Unit';
phu_names['BCHU'] <- 'Brant County Health Unit';
phu_names['DRHD'] <- 'Durham Regional Health Unit';
phu_names['GBHU'] <- 'Grey Bruce Health Unit';
phu_names['HNHU'] <- 'Haldimand-Norfolk Health Unit';
phu_names['HKPRDHU'] <- 'Haliburton, Kawartha, Pine Ridge District Health Unit';
phu_names['HRHD'] <- 'Halton Regional Health Unit';
phu_names['CHPHS'] <- 'City of Hamilton Health Unit';
phu_names['HPE'] <- 'Hastings and Prince Edward Counties Health Unit';
phu_names['HCHU'] <- 'Huron County Health Unit';
phu_names['CKPHS'] <- 'Chatham-Kent Health Unit';
phu_names['KFLA'] <- 'Kingston, Frontenac and Lennox and Addington Health Unit';
phu_names['CLCHSD'] <- 'Lambton Health Unit';
phu_names['LGL'] <- 'Leeds, Grenville and Lanark District Health Unit';
phu_names['MLHU'] <- 'Middlesex-London Health Unit';
phu_names['NPHU'] <- 'Niagara Regional Area Health Unit';
phu_names['NBPHU'] <- 'North Bay Parry Sound District Health Unit';
phu_names['NWHU'] <- 'Northwestern Health Unit';
phu_names['COHU'] <- 'City of Ottawa Health Unit';
phu_names['PEEL'] <- 'Peel Public Health';
phu_names['PDHU'] <- 'Perth District Health Unit';
phu_names['PCCHU'] <- 'Peterborough Public Health';
phu_names['PHU'] <- 'Porcupine Health Unit';
phu_names['RCDHU'] <- 'Renfrew County and District Health Unit';
phu_names['EOHU'] <- 'The Eastern Ontario Health Unit';
phu_names['SMDHU'] <- 'Simcoe Muskoka District Health Unit';
phu_names['SWPH'] <- 'Southwestern Public Health';
phu_names['SDHU'] <- 'Sudbury and District Health Unit';
phu_names['TBPHU'] <- 'Thunder Bay District Health Unit';
phu_names['THU'] <- 'Timiskaming Health Unit';
phu_names['WHU'] <- 'Waterloo Health Unit';
phu_names['WDGHU'] <- 'Wellington-Dufferin-Guelph Health Unit';
phu_names['WECHU'] <- 'Windsor-Essex County Health Unit';
phu_names['YRHU'] <- 'York Regional Health Unit';
phu_names['TOR'] <- 'Toronto Public Health';
#names(phu_names) <- as.factor(names(phu_names));
phu_names <- as.factor(phu_names);
data$phuname <- phu_names[as.character(data$PHU)];

write.csv(xtabs(PctResp~AdmissionDate + phuname, data), 'pctresp.csv');
write.csv(xtabs(RespVisits~AdmissionDate + phuname, data), 'respvisits.csv');
write.csv(data, 'fulldata.csv');
