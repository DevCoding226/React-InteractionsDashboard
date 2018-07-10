/* eslint-disable camelcase */
import { Record } from 'immutable';

class TherapeuticArea extends Record({
  id: undefined,
  name: '',
}) {
  toApiData() {
    return this.toJS();
  }
  static fromApiData(data) {
    return new TherapeuticArea(data);
  }
}

export default TherapeuticArea;
