export const SYNDROMES = [
  { id:'DENGUE_LIKE',  label:'Dengue-like illness',
    core:['fever','eye','rash','ache'],           vector:true },
  { id:'CHOLERA_LIKE', label:'Waterborne illness',
    core:['diarrhea','vomit'],                     vector:true },
  { id:'MEASLES_LIKE', label:'Measles-like illness',
    core:['fever','rash','cough','eye'],           vector:false },
  { id:'RESPIRATORY',  label:'Respiratory illness',
    core:['cough','fever'],                        vector:false },
];
