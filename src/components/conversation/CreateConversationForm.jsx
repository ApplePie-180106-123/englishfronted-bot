import React, { useState } from 'react';
import { useConversations } from '../../hooks/useConversations';
import { validationUtils } from '../../utils/validation';
import { MESSAGES } from '../../constants/messages';
import Input from '../common/Input';
import Button from '../common/Button';

const CreateConversationForm = ({ onSuccess, onCancel }) => {
  const { createConversation } = useConversations();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validationUtils.required(formData.title)) {
      newErrors.title = MESSAGES.REQUIRED_FIELD;
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const conversation = await createConversation(formData);
      if (conversation && onSuccess) {
        onSuccess(conversation);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter conversation title"
        required
      />
      
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Enter conversation description (optional)"
      />
      
      <Input
        label="Image URL"
        name="image"
        type="url"
        value={formData.image}
        onChange={handleChange}
        error={errors.image}
        placeholder="Enter image URL (optional)"
      />
      
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          Create Conversation
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateConversationForm;