import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Container, { Section, SectionHeader } from '../components/ui/Container';
import Logo from '../components/ui/Logo';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';
import Radio from '../components/ui/Radio';
import FormGroup from '../components/ui/FormGroup';

/**
 * StyleGuide Page - Displays all design system components in one place
 * This serves as a visual reference for the design system and helps verify design changes
 */
const StyleGuide = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [formState, setFormState] = useState({
    textInput: '',
    textAreaInput: '',
    selectInput: '',
    checkboxInput: false,
    radioInput: 'option1'
  });
  
  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'layouts', label: 'Layouts' },
    { id: 'forms', label: 'Forms' },
    { id: 'loaders', label: 'Loaders' },
    { id: 'logos', label: 'Logos' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-primary-800 py-6">
        <Container>
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-display">Truvista Design System</h1>
            <Button
              as={Link}
              to="/"
              variant="secondary"
              size="sm"
            >
              Back to Home
            </Button>
          </div>
        </Container>
      </header>
      
      {/* Navigation Tabs */}
      <Container>
        <div className="border-b border-neutral-200 mt-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`py-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-800'
                    : 'border-transparent text-neutral-700 hover:text-neutral-800 hover:border-neutral-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </Container>
      
      {/* Content */}
      <Container className="py-8">
        {/* Forms Section */}
        {activeTab === 'forms' && (
          <div>
            <SectionHeader title="Form Components" subtitle="Input and selection components for user data collection" />
            
            {/* Text Input */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Text Input</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-base font-medium mb-3">Default State</h4>
                  <FormGroup 
                    label="Full Name" 
                    htmlFor="name-default"
                    required
                    description="Enter your legal name as it appears on your ID"
                  >
                    <Input
                      id="name-default"
                      name="textInput"
                      value={formState.textInput}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">With Icons</h4>
                  <FormGroup 
                    label="Email Address" 
                    htmlFor="email-icon"
                  >
                    <Input
                      id="email-icon"
                      type="email"
                      placeholder="example@domain.com"
                      startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      }
                    />
                  </FormGroup>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-base font-medium mb-3">Error State</h4>
                  <FormGroup 
                    label="Phone Number" 
                    htmlFor="phone-error"
                  >
                    <Input
                      id="phone-error"
                      type="tel"
                      placeholder="(123) 456-7890"
                      status="error"
                      helperText="Please enter a valid phone number"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Success State</h4>
                  <FormGroup 
                    label="Username" 
                    htmlFor="username-success"
                  >
                    <Input
                      id="username-success"
                      placeholder="yourusername"
                      status="success"
                      helperText="Username is available"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Disabled State</h4>
                  <FormGroup 
                    label="Reference ID" 
                    htmlFor="ref-disabled"
                  >
                    <Input
                      id="ref-disabled"
                      value="REF-12345"
                      disabled
                      helperText="This field cannot be edited"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
            
            {/* TextArea */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Text Area</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-base font-medium mb-3">Default State</h4>
                  <FormGroup 
                    label="Property Description" 
                    htmlFor="description-default"
                  >
                    <TextArea
                      id="description-default"
                      name="textAreaInput"
                      value={formState.textAreaInput}
                      onChange={handleInputChange}
                      placeholder="Describe the property features and amenities..."
                      rows={4}
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Error State</h4>
                  <FormGroup 
                    label="Comments" 
                    htmlFor="comments-error"
                  >
                    <TextArea
                      id="comments-error"
                      placeholder="Enter your comments..."
                      rows={4}
                      status="error"
                      helperText="Comments must be at least 20 characters long"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
            
            {/* Select */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Select Dropdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-base font-medium mb-3">Default State</h4>
                  <FormGroup 
                    label="Property Type" 
                    htmlFor="property-type"
                  >
                    <Select
                      id="property-type"
                      name="selectInput"
                      value={formState.selectInput}
                      onChange={handleInputChange}
                      placeholder="Select property type"
                      options={[
                        { value: 'apartment', label: 'Apartment' },
                        { value: 'house', label: 'House' },
                        { value: 'condo', label: 'Condo' },
                        { value: 'townhouse', label: 'Townhouse' },
                      ]}
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Error State</h4>
                  <FormGroup 
                    label="Bedrooms" 
                    htmlFor="bedrooms-error"
                  >
                    <Select
                      id="bedrooms-error"
                      placeholder="Select number of bedrooms"
                      options={[
                        { value: '1', label: '1 Bedroom' },
                        { value: '2', label: '2 Bedrooms' },
                        { value: '3', label: '3 Bedrooms' },
                        { value: '4', label: '4+ Bedrooms' },
                      ]}
                      status="error"
                      helperText="Please select the number of bedrooms"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Disabled State</h4>
                  <FormGroup 
                    label="Location" 
                    htmlFor="location-disabled"
                  >
                    <Select
                      id="location-disabled"
                      placeholder="Select location"
                      options={[
                        { value: 'ny', label: 'New York' },
                        { value: 'la', label: 'Los Angeles' },
                        { value: 'ch', label: 'Chicago' },
                        { value: 'mi', label: 'Miami' },
                      ]}
                      disabled
                      helperText="Location selection is currently unavailable"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
            
            {/* Checkbox */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Checkbox</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-base font-medium mb-3">Default States</h4>
                  <FormGroup>
                    <Checkbox
                      name="checkboxInput"
                      checked={formState.checkboxInput}
                      onChange={handleInputChange}
                      label="I agree to receive marketing communications"
                      className="mb-3"
                    />
                    
                    <Checkbox
                      label="This is an unchecked checkbox"
                      className="mb-3"
                    />
                    
                    <Checkbox
                      checked
                      disabled
                      label="This is a disabled checked checkbox"
                      className="mb-3"
                    />
                    
                    <Checkbox
                      disabled
                      label="This is a disabled unchecked checkbox"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Validation States</h4>
                  <Checkbox
                    label="This checkbox has an error"
                    status="error"
                    helperText="You must check this box to continue"
                    className="mb-4"
                  />
                  
                  <Checkbox
                    checked
                    label="This checkbox has success state"
                    status="success"
                    helperText="Successfully verified"
                  />
                </div>
              </div>
            </div>
            
            {/* Radio */}
            <div>
              <h3 className="font-bold text-lg mb-4">Radio Buttons</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-base font-medium mb-3">Default Radio Group</h4>
                  <FormGroup 
                    label="Select listing type" 
                    className="mb-2"
                  >
                    <Radio
                      name="radioInput"
                      value="option1"
                      checkedValue={formState.radioInput}
                      onChange={handleInputChange}
                      label="For Sale"
                      className="mb-3"
                    />
                    
                    <Radio
                      name="radioInput"
                      value="option2"
                      checkedValue={formState.radioInput}
                      onChange={handleInputChange}
                      label="For Rent"
                      className="mb-3"
                    />
                    
                    <Radio
                      name="radioInput"
                      value="option3"
                      checkedValue={formState.radioInput}
                      onChange={handleInputChange}
                      label="Both"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <h4 className="text-base font-medium mb-3">Validation States</h4>
                  <div className="mb-4">
                    <Radio
                      name="radioValidation"
                      value="error"
                      checkedValue="error"
                      label="This radio has an error"
                      status="error"
                      helperText="Please select a different option"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Radio
                      name="radioValidation"
                      value="success"
                      checkedValue="success"
                      label="This radio has success state"
                      status="success"
                      helperText="Great choice!"
                    />
                  </div>
                  
                  <div>
                    <Radio
                      name="radioDisabled"
                      value="disabled"
                      checkedValue="disabled"
                      label="This radio is disabled"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Colors Section */}
        {activeTab === 'colors' && (
          <div>
            <SectionHeader title="Color Palette" subtitle="The foundation of our visual language" />
            
            {/* Primary Colors */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">Primary Blues</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade}>
                    <div className={`h-24 rounded-md bg-primary-${shade} shadow-sm`}></div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Primary {shade}</div>
                      <code className="text-xs text-neutral-600">primary-{shade}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Secondary Colors */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">Secondary Golds</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade}>
                    <div className={`h-24 rounded-md bg-secondary-${shade} shadow-sm`}></div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Secondary {shade}</div>
                      <code className="text-xs text-neutral-600">secondary-{shade}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Neutral Colors */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">Neutral Cream</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade}>
                    <div className={`h-24 rounded-md bg-neutral-${shade} shadow-sm`}></div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Neutral {shade}</div>
                      <code className="text-xs text-neutral-600">neutral-{shade}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Semantic Colors */}
            <div>
              <h3 className="font-bold text-lg mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="h-24 rounded-md bg-success-500 shadow-sm"></div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">Success</div>
                    <code className="text-xs text-neutral-600">success-500</code>
                  </div>
                </div>
                <div>
                  <div className="h-24 rounded-md bg-error-500 shadow-sm"></div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">Error</div>
                    <code className="text-xs text-neutral-600">error-500</code>
                  </div>
                </div>
                <div>
                  <div className="h-24 rounded-md bg-warning-500 shadow-sm"></div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">Warning</div>
                    <code className="text-xs text-neutral-600">warning-500</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Typography Section */}
        {activeTab === 'typography' && (
          <div>
            <SectionHeader title="Typography" subtitle="Text styles and hierarchy" />
            
            {/* Headings */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Headings</h3>
              <div className="space-y-8">
                <div className="border-b border-neutral-200 pb-4">
                  <h1>Heading 1 - Cormorant Garamond</h1>
                  <code className="text-xs text-neutral-600">h1, text-4xl md:text-5xl</code>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <h2>Heading 2 - Cormorant Garamond</h2>
                  <code className="text-xs text-neutral-600">h2, text-3xl md:text-4xl</code>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <h3>Heading 3 - Cormorant Garamond</h3>
                  <code className="text-xs text-neutral-600">h3, text-2xl md:text-3xl</code>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <h4>Heading 4 - Cormorant Garamond</h4>
                  <code className="text-xs text-neutral-600">h4, text-xl md:text-2xl</code>
                </div>
              </div>
            </div>
            
            {/* Body Text */}
            <div>
              <h3 className="font-bold text-lg mb-4">Body Text</h3>
              <div className="space-y-8">
                <div className="border-b border-neutral-200 pb-4">
                  <p className="text-lg">Large Body Text - Montserrat, 18px. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                  <code className="text-xs text-neutral-600">text-lg</code>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <p>Regular Body Text - Montserrat, 16px. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                  <code className="text-xs text-neutral-600">text-base</code>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <p className="text-sm">Small Body Text - Montserrat, 14px. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                  <code className="text-xs text-neutral-600">text-sm</code>
                </div>
                <div className="border-b border-neutral-200 pb-4">
                  <p className="text-xs">Extra Small Text - Montserrat, 12px. Used for captions, footnotes and supplementary information.</p>
                  <code className="text-xs text-neutral-600">text-xs</code>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Buttons Section */}
        {activeTab === 'buttons' && (
          <div>
            <SectionHeader title="Buttons" subtitle="Interactive elements for user actions" />
            
            {/* Button Variants */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
              </div>
              <div className="p-8 bg-primary-800 rounded-lg">
                <h4 className="text-white mb-4">On Dark Background</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">Outline Button</Button>
                  <Button variant="ghost" className="text-white hover:bg-white/10">Ghost Button</Button>
                </div>
              </div>
            </div>
            
            {/* Button Sizes */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="xs">Extra Small</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>
            
            {/* Button States */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Button States</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm mb-2">Default</p>
                  <Button variant="primary">Default Button</Button>
                </div>
                <div>
                  <p className="text-sm mb-2">Disabled</p>
                  <Button variant="primary" disabled>Disabled Button</Button>
                </div>
                <div>
                  <p className="text-sm mb-2">Loading</p>
                  <Button variant="primary" isLoading>Loading Button</Button>
                </div>
                <div>
                  <p className="text-sm mb-2">Full Width</p>
                  <Button variant="primary" fullWidth>Full Width Button</Button>
                </div>
              </div>
            </div>
            
            {/* Buttons with Icons */}
            <div>
              <h3 className="font-bold text-lg mb-4">Buttons with Icons</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="primary" 
                  startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Start Icon
                </Button>
                <Button 
                  variant="primary" 
                  endIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  End Icon
                </Button>
                <Button 
                  variant="outline" 
                  startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Outline with Icon
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cards Section */}
        {activeTab === 'cards' && (
          <div>
            <SectionHeader title="Cards" subtitle="Container components for displaying content" />
            
            {/* Card Variants */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">Default Card</h3>
                <Card>
                  <Card.Header divided>
                    <h4 className="text-lg font-semibold">Card Title</h4>
                  </Card.Header>
                  <Card.Body className="p-6">
                    <p>This is the default card variant with a divided header.</p>
                  </Card.Body>
                  <Card.Footer divided className="px-6 py-4">
                    <Button variant="primary" size="sm">Action</Button>
                  </Card.Footer>
                </Card>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4">Elegant Card</h3>
                <Card variant="elegant">
                  <h4 className="text-lg font-semibold mb-3">Elegant Card</h4>
                  <p className="mb-4">This card has a more elegant styling with softer shadows.</p>
                  <Button variant="primary" size="sm">Action</Button>
                </Card>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4">Outline Card</h3>
                <Card variant="outline">
                  <div className="p-6">
                    <h4 className="text-lg font-semibold mb-3">Outline Card</h4>
                    <p className="mb-4">This card has a border outline instead of shadows.</p>
                    <Button variant="primary" size="sm">Action</Button>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Property Card */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Property Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card variant="property" className="max-w-sm">
                  <Card.Image 
                    overlay
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6" 
                    alt="Sample property"
                    className="h-48" 
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold">Modern Villa</h4>
                      <Card.Badge variant="primary">For Sale</Card.Badge>
                    </div>
                    <p className="text-neutral-700 mb-3">123 Luxury Lane, Beverly Hills</p>
                    <div className="flex justify-between items-center">
                      <p className="text-primary-800 font-semibold">$1,250,000</p>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </Card>
                
                <Card variant="property" className="max-w-sm">
                  <Card.Image 
                    overlay
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750" 
                    alt="Sample property"
                    className="h-48" 
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold">Luxury Condo</h4>
                      <Card.Badge variant="secondary">For Rent</Card.Badge>
                    </div>
                    <p className="text-neutral-700 mb-3">456 Ocean Drive, Malibu</p>
                    <div className="flex justify-between items-center">
                      <p className="text-primary-800 font-semibold">$5,800/mo</p>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </Card>
                
                <Card variant="property" className="max-w-sm">
                  <Card.Image 
                    overlay
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" 
                    alt="Sample property"
                    className="h-48" 
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold">Modern Apartment</h4>
                      <Card.Badge variant="success">New Listing</Card.Badge>
                    </div>
                    <p className="text-neutral-700 mb-3">789 Downtown Blvd, Los Angeles</p>
                    <div className="flex justify-between items-center">
                      <p className="text-primary-800 font-semibold">$750,000</p>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Card Badges */}
            <div>
              <h3 className="font-bold text-lg mb-4">Card Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Card.Badge variant="primary">Primary Badge</Card.Badge>
                <Card.Badge variant="secondary">Secondary Badge</Card.Badge>
                <Card.Badge variant="success">Success Badge</Card.Badge>
                <Card.Badge variant="error">Error Badge</Card.Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Layouts Section */}
        {activeTab === 'layouts' && (
          <div>
            <SectionHeader title="Layout Components" subtitle="Container and section components for page layouts" />
            
            {/* Containers */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Containers</h3>
              <p className="mb-8">Containers provide consistent padding and max-width constraints across the application.</p>
              
              <div className="space-y-8">
                <div className="border border-dashed border-neutral-300 p-2 rounded-lg">
                  <div className="bg-white p-4 rounded text-center">
                    <p className="font-medium">Default Container</p>
                    <code className="text-xs text-neutral-600">max-w-7xl with responsive padding</code>
                  </div>
                </div>
                
                <div className="border border-dashed border-neutral-300 p-2 rounded-lg">
                  <Container fluid className="bg-white p-4 rounded text-center">
                    <p className="font-medium">Fluid Container</p>
                    <code className="text-xs text-neutral-600">fluid=true (full width)</code>
                  </Container>
                </div>
              </div>
            </div>
            
            {/* Sections with Backgrounds */}
            <div>
              <h3 className="font-bold text-lg mb-4">Section Backgrounds</h3>
              <p className="mb-8">Sections provide consistent vertical spacing and can have different background colors.</p>
              
              <div className="space-y-8">
                <Section className="py-8" background="cream">
                  <div className="text-center">
                    <p className="font-medium">Cream Background Section</p>
                    <code className="text-xs text-neutral-600">background="cream"</code>
                  </div>
                </Section>
                
                <Section className="py-8" background="primary">
                  <div className="text-center">
                    <p className="font-medium">Primary Background Section</p>
                    <code className="text-xs text-neutral-600">background="primary"</code>
                  </div>
                </Section>
                
                <Section className="py-8" background="secondary">
                  <div className="text-center">
                    <p className="font-medium">Secondary Background Section</p>
                    <code className="text-xs text-neutral-600">background="secondary"</code>
                  </div>
                </Section>
                
                <Section className="py-8" background="dark">
                  <div className="text-center">
                    <p className="font-medium">Dark Background Section</p>
                    <code className="text-xs text-neutral-600">background="dark"</code>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        )}
        
        {/* Loaders Section */}
        {activeTab === 'loaders' && (
          <div>
            <SectionHeader title="Loading States" subtitle="Visual indicators for loading processes" />
            
            {/* Spinner Sizes */}
            <div className="mb-12">
              <h3 className="font-bold text-lg mb-4">Spinner Sizes</h3>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center">
                  <p className="text-sm mb-2">Small</p>
                  <LoadingSpinner size="sm" />
                </div>
                <div className="text-center">
                  <p className="text-sm mb-2">Medium (Default)</p>
                  <LoadingSpinner size="md" />
                </div>
                <div className="text-center">
                  <p className="text-sm mb-2">Large</p>
                  <LoadingSpinner size="lg" />
                </div>
                <div className="text-center">
                  <p className="text-sm mb-2">Extra Large</p>
                  <LoadingSpinner size="xl" />
                </div>
              </div>
            </div>
            
            {/* Spinner Colors */}
            <div>
              <h3 className="font-bold text-lg mb-4">Spinner Colors</h3>
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <p className="text-sm mb-2">Primary</p>
                  <LoadingSpinner color="primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm mb-2">Secondary</p>
                  <LoadingSpinner color="secondary" />
                </div>
                <div className="text-center p-4 bg-primary-800 rounded-lg">
                  <p className="text-sm mb-2 text-white">White (for dark backgrounds)</p>
                  <LoadingSpinner color="white" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Logos Section */}
        {activeTab === 'logos' && (
          <div>
            <SectionHeader title="Logo Variants" subtitle="Brand identity elements" />
            
            {/* Logo Variants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Dark Variant (for light backgrounds)</h3>
                <div className="flex items-center justify-center">
                  <Logo variant="dark" />
                </div>
                <div className="mt-8 flex items-center justify-center">
                  <Logo variant="dark" withTagline />
                </div>
              </div>
              
              <div className="p-8 bg-primary-800 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-white">Light Variant (for dark backgrounds)</h3>
                <div className="flex items-center justify-center">
                  <Logo variant="light" />
                </div>
                <div className="mt-8 flex items-center justify-center">
                  <Logo variant="light" withTagline />
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default StyleGuide; 