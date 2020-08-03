import React, { FC } from 'react';
import { useSelector, useDispatch } from '@alipay/kop';
import { useParams } from 'react-router';
import DatasetIcon from '../../../../common/component/DatasetIcon';
import module from '../index';
import './index.css';

interface Props {}

interface DatasetListItem {
  id: string;
  name: string;
}

const DatasetList: FC<Props> = props => {
  const dispatch = useDispatch();
  const params = useParams<{ id: string }>();
  const datasetList = useSelector((state: any) =>
    module.selectors.getDatasetList(state, params.id)
  );

  const selectedDatasetId = useSelector(module.selectors.getSelectedDatasetId);

  const changeSelected = (id: string) => {
    dispatch(module.actions.setSelectedDataset(id));
  };

  return (
    <div className="dataset-list">
      <div className="title">数据集</div>
      <div className="list">
        {datasetList.map((dataset: DatasetListItem, index: number) => {
          return (
            <div
              key={index}
              className={
                selectedDatasetId === dataset.id ? 'item selected' : 'item'
              }
              onClick={() => {
                changeSelected(dataset.id);
              }}
            >
              <DatasetIcon />
              <span>{dataset.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatasetList;
