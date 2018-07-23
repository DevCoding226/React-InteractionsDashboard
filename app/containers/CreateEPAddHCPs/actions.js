import { makeActionCreators } from 'utils/actions';


export const searchHCPsActions = makeActionCreators(
  'CREATE_EP/SEARCH_HCPS',
  {
    request: (search) => ({ search }),
    success: (hcps) => ({ hcps }),
    error: (message) => ({ message }),
  }
);


export const fetchHCPActions = makeActionCreators(
  'CREATE_EP/FETCH_HCP',
  {
    request: (hcpId) => ({ hcpId }),
    success: (hcp) => ({ hcp }),
    error: (message) => ({ message }),
  }
);
