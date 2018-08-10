import React from 'react';
import { FormControl, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import Comment from 'components/Comment';
import { Options } from './forms';

const makeKey = (obj, idx) => `${obj.id || ''}.${idx}`;

export const EPFormObjective = ({
  mode,
  hideRemove,
  currentQuarter,
  itemObjectId,
  objective,
  objectiveIdx,
  updateObjective,
  removeObjective,
  addDeliverable,
  updateDeliverable,
  removeDeliverable,
  deliverableStatusChoices,
  fieldPrefix,
  fieldsErrors,
  fieldsTouched,
  showAllStepErrors,
  children,
}) => {
  // deliverables gruped by quarter:
  const deliverablesByQuarter = { 1: [], 2: [], 3: [], 4: [] };
  // "quarter status" - the status of most deliverables in the quarter,
  // and if there are similar number of multiple statuses, pick the "worst":
  const quarterStatuses = {};

  const quarterStatusCounts = { 1: {}, 2: {}, 3: {}, 4: {} };
  for (const [idx, dlv] of objective.deliverables.entries()) {
    deliverablesByQuarter[dlv.quarter].push([idx, dlv]);
    quarterStatusCounts[dlv.quarter][dlv.status] =
      (quarterStatusCounts[dlv.quarter][dlv.status] || 0) + 1;
  }

  const deliverableStatuses = Object.keys(deliverableStatusChoices).reverse();
  for (const [quarterN, statusCounts] of Object.entries(quarterStatusCounts)) {
    const sortedCounts = Object.entries(statusCounts).sort(
      ([s1, c1], [s2, c2]) => {
        if (c1 === c2) {
          const s1_idx = deliverableStatuses.indexOf(s1);
          const s2_idx = deliverableStatuses.indexOf(s2);
          if (s1_idx === s2_idx) return 0;
          return s1_idx < s2_idx ? -1 : 1;
        }
        return c1 < c2 ? 1 : -1;
      }
    );
    if (sortedCounts.length) {
      quarterStatuses[quarterN] = sortedCounts[0][0];
    }
  }

  console.log('--- quarterStatuses:', quarterStatuses);

  return (
    <div className="EPForm__PlanItem__section">
      <div className="EPForm__PlanItem__section__heading EPFormObjective__heading">
        {(mode === 'create' || !objective.id) &&
          !hideRemove && (
            <Button
              className="pull-right"
              onClick={() => removeObjective(itemObjectId, objectiveIdx)}
            >
              ✖
            </Button>
          )}
        <span className="icon-objective" /> Objective {objectiveIdx + 1}
        {objective.comments.map((comment) => (
          <Comment comment={comment} key={comment.id} />
        ))}
      </div>
      <div className="EPForm__PlanItem__section__body EPFormObjective__body">
        {mode === 'create' || (!objective.id && mode !== 'view') ? (
          <FormGroup
            validationState={
              (fieldsTouched.get(
                `${fieldPrefix}.objectives.${objectiveIdx}.description`
              ) ||
                showAllStepErrors) &&
              fieldsErrors.get(
                `${fieldPrefix}.objectives.${objectiveIdx}.description`
              )
                ? 'error'
                : null
            }
          >
            <FormControl
              componentClass="textarea"
              placeholder="Objective Description"
              value={objective.description}
              onChange={(ev) =>
                updateObjective(itemObjectId, objectiveIdx, {
                  description: ev.target.value,
                })
              }
            />
          </FormGroup>
        ) : (
          <p>{objective.description}</p>
        )}
        {children}
        <ControlLabel>DELIVERABLES</ControlLabel>

        {[1, 2, 3, 4].map((quarterN) => {
          if (
            !deliverablesByQuarter[quarterN].length &&
            (quarterN < currentQuarter || mode === 'view')
          ) {
            return null;
          }
          return (
            <div key={quarterN} className="EPFormDeliverables__quarter">
              <div
                className={`EPFormDeliverables__quarterLabel EPFormDeliverables__quarterLabel--${
                  quarterStatuses[quarterN]
                }`}
              >
                Q{quarterN}
              </div>

              <div className="EPFormDeliverables__deliverables">
                {deliverablesByQuarter[quarterN].map(
                  ([deliverableIdx, deliverable], deliverableN) => (
                    <div
                      key={`${deliverableIdx}:${deliverable.id}`}
                      className="EPFormDeliverable__deliverable"
                    >
                      <div
                        className={`EPFormDeliverable__deliverableLabel EPFormDeliverable__deliverableLabel--${
                          deliverable.status
                        }`}
                      >
                        <div
                          className={`EPFormDeliverable__deliverableLabel__label EPFormDeliverable__deliverableLabel__label--${
                            deliverable.status
                          }`}
                        >
                          Q{quarterN} / DELIVERABLE {deliverableN + 1}
                        </div>
                        <div
                          className={`EPFormDeliverable__deliverableLabel__status EPFormDeliverable__deliverableLabel__status--${
                            deliverable.status
                          }`}
                        >
                          {(
                            deliverableStatusChoices[deliverable.status] || ''
                          ).toUpperCase()}
                        </div>
                      </div>

                      <div className="EPFormDeliverable__deliverableMain">
                        <div className="EPFormDeliverable__deliverableMain__description">
                          {deliverable.quarter_type !== 'past' &&
                          (!deliverable.id && mode !== 'view') ? (
                            <FormGroup
                              validationState={
                                (fieldsTouched.get(
                                  `${fieldPrefix}.objectives.${objectiveIdx}.deliverables` +
                                    `.${deliverableIdx}.description`
                                ) ||
                                  showAllStepErrors) &&
                                fieldsErrors.get(
                                  `${fieldPrefix}.objectives.${objectiveIdx}.deliverables` +
                                    `.${deliverableIdx}.description`
                                )
                                  ? 'error'
                                  : null
                              }
                            >
                              <FormControl
                                type="text"
                                placeholder="Deliverable description"
                                value={deliverable.description}
                                onChange={(ev) =>
                                  updateDeliverable(
                                    itemObjectId,
                                    objectiveIdx,
                                    deliverableIdx,
                                    {
                                      description: ev.target.value,
                                    }
                                  )
                                }
                              />
                            </FormGroup>
                          ) : (
                            <p>{deliverable.description}</p>
                          )}
                        </div>
                        {// when to have deliverable status editable
                        // never in 'view' mode
                        mode !== 'view' &&
                          // editable when freshly added
                          (!deliverable.id ||
                            // or it didn't have status set
                            !deliverable.status ||
                            // or just had it set after not having it
                            fieldsTouched.get(
                              `${fieldPrefix}.objectives.${objectiveIdx}.deliverables.${deliverableIdx}.status`
                            )) &&
                          // and never for future quarters
                          deliverable.status_type !== 'future' && (
                            <div className="EPFormDeliverable__deliverableMain__status">
                              <ControlLabel>SELECT STATUS</ControlLabel>
                              <div>
                                {Object.entries(deliverableStatusChoices).map(
                                  ([value, label]) => (
                                    <Button
                                      key={value}
                                      className={`EPFormDeliverable__deliverableMain__status__btn EPFormDeliverable__deliverableMain__status__btn--${value} ${
                                        deliverable.status === value
                                          ? `EPFormDeliverable__deliverableMain__status__btn--${value}--active`
                                          : ''
                                      }`}
                                      onClick={() =>
                                        updateDeliverable(
                                          itemObjectId,
                                          objectiveIdx,
                                          deliverableIdx,
                                          {
                                            status: value,
                                          }
                                        )
                                      }
                                    >
                                      {label.toUpperCase()}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        <div className="EPFormDeliverable__deliverableMain__removeBtn">
                          {(mode === 'create' || !objective.id) &&
                            !hideRemove && (
                              <Button
                                onClick={() =>
                                  removeDeliverable(
                                    itemObjectId,
                                    objectiveIdx,
                                    deliverableIdx
                                  )
                                }
                              >
                                ✖
                              </Button>
                            )}
                        </div>
                        <div className="EPFormDeliverable__deliverableMain__comments">
                          {deliverable.comments.map((comment) => (
                            <Comment comment={comment} key={comment.id} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
                {mode !== 'view' &&
                  quarterN >= currentQuarter && (
                    <Button
                      onClick={() =>
                        addDeliverable(itemObjectId, objectiveIdx, quarterN)
                      }
                      className="EPFormDeliverable__addDeliverableBtn"
                    >
                      + DELIVERABLE
                    </Button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const EPFormDeliverable = ({
  mode,
  hideRemove,
  // currentQuarter,
  itemObjectId,
  objective,
  objectiveIdx,
  deliverable,
  deliverableIdx,
  deliverableStatusChoices,
  updateDeliverable,
  removeDeliverable,
  fieldPrefix,
  fieldsErrors,
  fieldsTouched,
  showAllStepErrors,
}) => (
  <div key={makeKey(deliverable, deliverableIdx)} className="EPFormDeliverable">
    {[1, 2, 3, 4].map((quarterN) => (
      <div key={quarterN} className="EPFormDeliverable__quarter">
        <div className="EPFormDeliverable__quarterLabel">Q{quarterN}</div>

        <div className="EPFormDeliverable__deliverables">
          <div className="EPFormDeliverable__deliverable">
            <div className="EPFormDeliverable__deliverableLabel">
              <div
                className={`EPFormDeliverable__deliverableLabel__label EPFormDeliverable__deliverableLabel__label--${
                  deliverable.status
                }`}
              >
                Q{quarterN} / DELIVERABLE {deliverableIdx + 1}
              </div>
              <div className="EPFormDeliverable__deliverableLabel__status">
                {deliverable.status}
              </div>
            </div>

            <div className="EPFormDeliverable__deliverableMain">
              <div className="EPFormDeliverable__deliverableMain__description">
                <FormGroup
                  validationState={
                    (fieldsTouched.get(
                      `${fieldPrefix}.objectives.${objectiveIdx}.deliverables` +
                        `.${deliverableIdx}.description`
                    ) ||
                      showAllStepErrors) &&
                    fieldsErrors.get(
                      `${fieldPrefix}.objectives.${objectiveIdx}.deliverables` +
                        `.${deliverableIdx}.description`
                    )
                      ? 'error'
                      : null
                  }
                >
                  <FormControl
                    type="text"
                    placeholder="Deliverable description"
                    value={deliverable.description}
                    onChange={(ev) =>
                      updateDeliverable(
                        itemObjectId,
                        objectiveIdx,
                        deliverableIdx,
                        {
                          description: ev.target.value,
                        }
                      )
                    }
                    disabled={deliverable.quarter_type === 'past'}
                  />
                </FormGroup>
              </div>
              <div className="EPFormDeliverable__deliverableMain__status">
                {deliverable.id && (
                  <FormControl
                    componentClass="select"
                    value={deliverable.status}
                    onChange={(ev) =>
                      updateDeliverable(
                        itemObjectId,
                        objectiveIdx,
                        deliverableIdx,
                        {
                          status: ev.target.value,
                        }
                      )
                    }
                    disabled={
                      deliverable.quarter_type === 'past' &&
                      deliverable.status !== ''
                    }
                  >
                    <option value="">- Pick Status -</option>
                    <Options
                      choices={Object.entries(deliverableStatusChoices)}
                    />
                  </FormControl>
                )}
              </div>
              <div className="EPFormDeliverable__deliverableMain__removeBtn">
                {(mode === 'create' || !objective.id) &&
                  !hideRemove && (
                    <Button
                      onClick={() =>
                        removeDeliverable(
                          itemObjectId,
                          objectiveIdx,
                          deliverableIdx
                        )
                      }
                    >
                      ✖
                    </Button>
                  )}
              </div>
              <div className="EPFormDeliverable__deliverableMain__comments" />
            </div>
          </div>
          <Button className="EPFormDeliverable__addDeliverableBtn">
            + DELIVERABLE
          </Button>
        </div>
      </div>
    ))}

    {/* <div>
      <FormControl
        componentClass="select"
        value={deliverable.quarter}
        onChange={(ev) =>
          updateDeliverable(itemObjectId, objectiveIdx, deliverableIdx, {
            quarter: +ev.target.value,
          })
        }
        disabled={mode === 'update' && objective.id}
      >
        <option value={1} disabled={currentQuarter > 1}>
          1
        </option>
        <option value={2} disabled={currentQuarter > 2}>
          2
        </option>
        <option value={3} disabled={currentQuarter > 3}>
          3
        </option>
        <option value={4}>4</option>
      </FormControl>
    </div> */}

    {/* <Col xs={8}>
      <FormGroup
        validationState={
          (fieldsTouched.get(
            `${fieldPrefix}.objectives.${objectiveIdx}.deliverables` +
              `.${deliverableIdx}.description`
          ) ||
            showAllStepErrors) &&
          fieldsErrors.get(
            `${fieldPrefix}.objectives.${objectiveIdx}.deliverables` +
              `.${deliverableIdx}.description`
          )
            ? 'error'
            : null
        }
      >
        <FormControl
          type="text"
          placeholder="Deliverable description"
          value={deliverable.description}
          onChange={(ev) =>
            updateDeliverable(itemObjectId, objectiveIdx, deliverableIdx, {
              description: ev.target.value,
            })
          }
          disabled={deliverable.quarter_type === 'past'}
        />
      </FormGroup>
    </Col> */}

    {/* <Col xs={2}>
      {deliverable.id && (
        <FormControl
          componentClass="select"
          value={deliverable.status}
          onChange={(ev) =>
            updateDeliverable(itemObjectId, objectiveIdx, deliverableIdx, {
              status: ev.target.value,
            })
          }
          disabled={
            deliverable.quarter_type === 'past' && deliverable.status !== ''
          }
        >
          <option value="">- Pick Status -</option>
          <Options choices={Object.entries(deliverableStatusChoices)} />
        </FormControl>
      )}
    </Col> */}

    {/* <Col xs={1}>
      {(mode === 'create' || !objective.id) &&
        !hideRemove && (
          <Button
            onClick={() =>
              removeDeliverable(itemObjectId, objectiveIdx, deliverableIdx)
            }
          >
            ✖
          </Button>
        )}
    </Col> */}
  </div>
);
