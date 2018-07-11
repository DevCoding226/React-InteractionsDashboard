/* eslint-disable camelcase */
import { Record, List } from 'immutable';


export class ProjectObjective extends Record({
  id: undefined,
  // relationships
  engagement_plan_item_id: undefined,
  hcp_id: undefined,
  deliverables: new List(),
  // fields
  description: '',
  created_at: undefined,
  updated_at: undefined,
}) {
  static READ_ONLY_FIELDS = [
    'created_at',
    'updated_at',
  ];

  toApiData() {
    const data = this.toJS();
    for (const f of ProjectObjective.READ_ONLY_FIELDS) {
      delete data[f];
    }
    return data;
  }

  static fromApiData(data) {
    let objective = new ProjectObjective(data);
    objective = objective.set('deliverabled', objective.deliverables.map(
      (deliverableData) => ProjectDeliverable.fromApiData(deliverableData)
    ));
    return objective;
  }
}


export class ProjectDeliverable extends Record({
  id: undefined,
  // relationships
  objective_id: undefined,
  // fields
  quarter: 1,
  description: '',
  status: '',
}) {
  toApiData() {
    return this.toJS();
  }

  static fromApiData(data) {
    return new ProjectDeliverable(data);
  }
}