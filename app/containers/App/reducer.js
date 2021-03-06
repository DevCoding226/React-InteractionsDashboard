import { fromJS, Map, OrderedMap } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import User from 'records/User';
import { SET_USER, LOGOUT, LOADING } from './constants';
import { fetchCommonDataActions, setFlashMessage } from './actions';

const initialState = new Map({
  user: null,
  ui: fromJS({
    loading: false,
  }),
  // therapeuticAreas: new OrderedMap(),
  // affiliateGroups: new OrderedMap(),
  therapeuticAreas: null,
  affiliateGroups: null,
  loadedCommonData: false,
  flashMessage: fromJS({
    text: 'default',
    type: '',
  }),
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER: {
      const affiliateGroupsById = state.get('affiliateGroups');
      const therapeuticAreasById = state.get('therapeuticAreas');
      const user =
        (affiliateGroupsById && affiliateGroupsById.size) ||
        (therapeuticAreasById && therapeuticAreasById.size)
          ? User.fromApiData(
              action.payload.user.toApiData(),
              therapeuticAreasById,
              affiliateGroupsById
            )
          : action.payload.user;
      return state.merge({
        user,
        loadedCommonData: !!(
          state.get('therapeuticAreas') && state.get('affiliateGroups')
        ),
      });
    }

    case LOGOUT:
      return state.set('user', null);

    case LOADING:
      return state.updateIn(['ui', 'loading'], () => action.loading);

    case fetchCommonDataActions.success.type: {
      const {
        affiliateGroups,
        therapeuticAreas,
        engagementPlans,
      } = action.payload;
      const affiliateGroupsById = new OrderedMap(
        affiliateGroups.map((it) => [it.id, it])
      );
      const therapeuticAreasById = new OrderedMap(
        therapeuticAreas.map((it) => [it.id, it])
      );
      return state.merge({
        user: state.get('user')
          ? User.fromApiData(
              state.get('user').toApiData(),
              therapeuticAreasById,
              affiliateGroupsById
            )
          : null,
        affiliateGroups: affiliateGroupsById,
        therapeuticAreas: therapeuticAreasById,
        engagementPlans,
        loadedCommonData: !!state.get('user'),
      });
    }

    case setFlashMessage.type:
      return state.set(
        'flashMessage',
        fromJS({
          text: action.payload.text,
          type: action.payload.type,
        })
      );

    case LOCATION_CHANGE:
      console.log('### LOCATION_CHANGE');
      return state.set('flashMessage', fromJS({}));

    default:
      return state;
  }
}

export default appReducer;
