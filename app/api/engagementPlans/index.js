import axios from '../config';

export function getEngagementPlans() {
  const config = {
    method: 'GET',
    url: '/engagement-plans/',
  };

  return axios(config);
}

export function postEngagementPlan(engagementPlan) {
  const config = {
    method: 'POST',
    url: '/engagement-plans/',
    data: engagementPlan,
  };

  return axios(config);
}

export function getEngagementPlan(id) {
  const config = {
    method: 'GET',
    url: `/engagement-plans/${id}`,
  };

  return axios(config);
}

export function patchEngagementPlan(id, engagementPlan) {
  const config = {
    method: 'PATCH',
    url: `/engagement-plans/${id}`,
    data: engagementPlan,
  };

  return axios(config);
}
