import { useNavigate } from "react-router-dom";
import { Form, Input } from "antd";

const { useForm } = Form;
const SearchBar = () => {
  const [form] = useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    const definedValues = {};
    for (const key in values) {
      if (
        values[key] !== null &&
        values[key] !== undefined &&
        values[key] !== ""
      ) {
        definedValues[key] = values[key];
      }
    }
    const queryString = new URLSearchParams(definedValues).toString();
    navigate(`/dashboard/search/results?${queryString}`);
  };
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="flex flex-col h-full"
    >
      <Form.Item name="search" noStyle>
        <Input.Search
          placeholder="Search by name, email, or expertise..."
          enterButton="Search"
          size="large"
          className=""
          onSearch={form.submit}
        />
      </Form.Item>
    </Form>
  );
};

export default SearchBar;
