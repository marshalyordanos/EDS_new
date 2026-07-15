import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Steps, Space } from 'antd';
const MultiStepForm = ({ 
  form,
  steps, 
  onSubmit, 
  onStep1Next, 
  isStep1Submitting,
  isSubmitting,
  submitButtonText = "Register"
 }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const handleCancel = () => {
         navigate('/dashboard/'); 
       };

  const handleNext = async () => {
    try {
      const fieldsToValidate = steps[currentStep].fields;
      const values = await form.validateFields(fieldsToValidate );
      if (currentStep === 0 && onStep1Next) {
        const success = await onStep1Next(values); 
        if (success) {
          setCurrentStep(currentStep + 1); 
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (errorInfo) {
      console.log('Validation Failed:', errorInfo);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = (values) => {
     onSubmit(values);
  };

  return (
    <div  className="flex flex-col h-full">
      <Steps current={currentStep} items={steps.map(item => ({ key: item.title, title: item.title }))} />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex flex-col flex-1 mt-10"
        initialValues={{ education: [{}], experience: [{}], research_experience: [{}] }}
      >
        <div className="flex-1">
         {steps.map((step, index) => (
            <div 
              key={step.title} 
              style={{ display: index === currentStep ? 'block' : 'none' }}
              >
           {typeof step.content === 'function' ? step.content() : step.content}
         </div>
           ))}
       </div>
        <div className="mt-8 pt-6 border-t border-[var(--theme-border-light)] flex justify-end">
          <Space>
            {currentStep > 0 && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button 
              type="primary" 
              onClick={handleNext}
               loading={currentStep === 0 && isStep1Submitting} 
              >
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <>
                <Button onClick={handleCancel} >Cancel</Button>
                <Button type="primary" htmlType="submit"
                loading={isSubmitting}
                >
                 {submitButtonText}
                </Button>
              </>
            )}
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default MultiStepForm;