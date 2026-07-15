import React, { useState } from "react";
import { Divider, Empty, Pagination, Radio, Table } from "antd";
import styled from "styled-components";

const CommonTable = React.memo(
  ({
    data,
    columns,
    rowSelectionType,
    setSelection,
    handlePagination,
    total,
    loadding,
    tableChange,
    type,
    scroll,
  }) => {
    const onShowSizeChange = (current, pageSize) => {
      console.log(current, pageSize);
      handlePagination(current, pageSize);
    };

    let rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        setSelection(selectedRows);
        console.log(
          `selectedRowKeys: ${selectedRowKeys}`,
          "selectedRows: ",
          selectedRows
        );
      },
      getCheckboxProps: (record) => ({
        disabled: type,
        name: type ? "" : record?.name,
      }),
    };

    console.log("common table");

    return (
      <div className="border border-[var(--theme-border-light)] rounded-xl overflow-hidden bg-[var(--theme-bg-primary)]">
        <div className="common_table">
          <Table
            scroll={{ x: "full" }}
            rowSelection={{
              type: rowSelectionType,
              ...rowSelection,
            }}
            loading={loadding}
            rowKey={"_id"}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
            columns={columns}
            dataSource={data}
            onChange={tableChange}
            pagination={false}
            className="text-base"
          />
        </div>

        {type ? (
          ""
        ) : (
          <div className="flex justify-end py-4 px-4 bg-[var(--theme-bg-secondary)] border-t border-[var(--theme-border-light)]">
            <Pagination
              total={total}
              defaultPageSize={10}
              defaultCurrent={1}
              pageSizeOptions={["10", "20"]}
              showSizeChanger={true}
              onChange={onShowSizeChange}
            />
          </div>
        )}
      </div>
    );
  }
);

export const TableStyle = styled.div`
  border: 1px solid var(--theme-border-light);
  margin: 0 24px;
  margin-top: 20px;
  background-color: var(--theme-bg-primary);
  border-radius: 10px;
  
  .common_table {
    width: 100%;
    overflow-x: auto;
  }
  
  .common_pagination {
    margin: 40px 15px;
    display: flex;
    justify-content: flex-end;
  }

  th {
    font-size: 15px;
    background-color: var(--theme-bg-secondary) !important;
    color: var(--theme-text-primary) !important;
  }

  tr {
    font-size: 15px;
    color: var(--theme-text-primary);
  }

  td {
    background-color: var(--theme-bg-primary) !important;
    color: var(--theme-text-primary) !important;
    border-color: var(--theme-border-light) !important;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: var(--theme-bg-tertiary) !important;
  }
`;

export default CommonTable;
