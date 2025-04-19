import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Car, Users, Image, Clock,
  ChevronDown, ChevronUp, Hash, Globe, MinusCircle, PlusCircle 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';

type InputFieldType = 
  | 'name' 
  | 'email' 
  | 'phone' 
  | 'address' 
  | 'license_plate' 
  | 'vehicle' 
  | 'social_media' 
  | 'relatives' 
  | 'image' 
  | 'physical';

interface FormValues {
  title: string;
  description?: string;
  inputs: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    license_plate?: string;
    vehicle?: {
      make?: string;
      model?: string;
      color?: string;
      year?: string;
    };
    social_media?: { platform: string; username: string }[];
    relatives?: { name: string; relation: string }[];
    image?: File | null;
    physical?: {
      height?: string;
      weight?: string;
      hair_color?: string;
      eye_color?: string;
    };
  };
}

interface InputFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

const InputForm = ({ onSubmit, isLoading = false }: InputFormProps) => {
  const [activeFields, setActiveFields] = useState<InputFieldType[]>(['name']);
  const [expanded, setExpanded] = useState(true);
  
  const { control, handleSubmit, register, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      inputs: {
        social_media: [{ platform: '', username: '' }],
        relatives: [{ name: '', relation: '' }]
      }
    }
  });
  
  const toggleField = (field: InputFieldType) => {
    if (activeFields.includes(field)) {
      setActiveFields(activeFields.filter(f => f !== field));
    } else {
      setActiveFields([...activeFields, field]);
    }
  };
  
  const addSocialMedia = () => {
    const newSocialMedia = { platform: '', username: '' };
    control._formValues.inputs.social_media = [
      ...(control._formValues.inputs.social_media || []),
      newSocialMedia
    ];
  };
  
  const removeSocialMedia = (index: number) => {
    const currentSocialMedia = control._formValues.inputs.social_media || [];
    if (currentSocialMedia.length > 1) {
      control._formValues.inputs.social_media = currentSocialMedia.filter((_, i) => i !== index);
    }
  };
  
  const addRelative = () => {
    const newRelative = { name: '', relation: '' };
    control._formValues.inputs.relatives = [
      ...(control._formValues.inputs.relatives || []),
      newRelative
    ];
  };
  
  const removeRelative = (index: number) => {
    const currentRelatives = control._formValues.inputs.relatives || [];
    if (currentRelatives.length > 1) {
      control._formValues.inputs.relatives = currentRelatives.filter((_, i) => i !== index);
    }
  };
  
  const submit = (data: FormValues) => {
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <CardTitle>Intelligence Gathering</CardTitle>
            <Button variant="ghost" size="icon">
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-300">
                      Investigation Title <span className="text-error-500">*</span>
                    </label>
                    <input
                      id="title"
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Enter a title for this investigation"
                      className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-error-500">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-300">
                      Description (Optional)
                    </label>
                    <input
                      id="description"
                      {...register('description')}
                      placeholder="Brief description of the investigation"
                      className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-300">Available Input Fields</p>
                  <div className="flex flex-wrap gap-2">
                    <FieldToggle 
                      icon={<User className="h-4 w-4" />}
                      label="Name"
                      active={activeFields.includes('name')}
                      onClick={() => toggleField('name')}
                    />
                    <FieldToggle 
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      active={activeFields.includes('email')}
                      onClick={() => toggleField('email')}
                    />
                    <FieldToggle 
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      active={activeFields.includes('phone')}
                      onClick={() => toggleField('phone')}
                    />
                    <FieldToggle 
                      icon={<MapPin className="h-4 w-4" />}
                      label="Address"
                      active={activeFields.includes('address')}
                      onClick={() => toggleField('address')}
                    />
                    <FieldToggle 
                      icon={<Hash className="h-4 w-4" />}
                      label="License Plate"
                      active={activeFields.includes('license_plate')}
                      onClick={() => toggleField('license_plate')}
                    />
                    <FieldToggle 
                      icon={<Car className="h-4 w-4" />}
                      label="Vehicle"
                      active={activeFields.includes('vehicle')}
                      onClick={() => toggleField('vehicle')}
                    />
                    <FieldToggle 
                      icon={<Globe className="h-4 w-4" />}
                      label="Social Media"
                      active={activeFields.includes('social_media')}
                      onClick={() => toggleField('social_media')}
                    />
                    <FieldToggle 
                      icon={<Users className="h-4 w-4" />}
                      label="Relatives"
                      active={activeFields.includes('relatives')}
                      onClick={() => toggleField('relatives')}
                    />
                    <FieldToggle 
                      icon={<Image className="h-4 w-4" />}
                      label="Image"
                      active={activeFields.includes('image')}
                      onClick={() => toggleField('image')}
                    />
                    <FieldToggle 
                      icon={<Clock className="h-4 w-4" />}
                      label="Physical"
                      active={activeFields.includes('physical')}
                      onClick={() => toggleField('physical')}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Name field */}
                  {activeFields.includes('name') && (
                    <div>
                      <label htmlFor="name" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <User className="h-4 w-4" />
                        <span>Full Name</span>
                      </label>
                      <input
                        id="name"
                        {...register('inputs.name')}
                        placeholder="Enter full name (supports fuzzy matching)"
                        className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                      />
                    </div>
                  )}
                  
                  {/* Email field */}
                  {activeFields.includes('email') && (
                    <div>
                      <label htmlFor="email" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Mail className="h-4 w-4" />
                        <span>Email Address</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('inputs.email')}
                        placeholder="Enter email address"
                        className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                      />
                    </div>
                  )}
                  
                  {/* Phone field */}
                  {activeFields.includes('phone') && (
                    <div>
                      <label htmlFor="phone" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Phone className="h-4 w-4" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        id="phone"
                        {...register('inputs.phone')}
                        placeholder="Enter phone number"
                        className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                      />
                    </div>
                  )}
                  
                  {/* Address field */}
                  {activeFields.includes('address') && (
                    <div>
                      <label htmlFor="address" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <MapPin className="h-4 w-4" />
                        <span>Address</span>
                      </label>
                      <input
                        id="address"
                        {...register('inputs.address')}
                        placeholder="Enter physical address"
                        className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                      />
                    </div>
                  )}
                  
                  {/* License plate field */}
                  {activeFields.includes('license_plate') && (
                    <div>
                      <label htmlFor="license_plate" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Hash className="h-4 w-4" />
                        <span>License Plate</span>
                      </label>
                      <input
                        id="license_plate"
                        {...register('inputs.license_plate')}
                        placeholder="Enter license plate number"
                        className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                      />
                    </div>
                  )}
                  
                  {/* Vehicle info fields */}
                  {activeFields.includes('vehicle') && (
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Car className="h-4 w-4" />
                        <span>Vehicle Information</span>
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="vehicle_make" className="mb-1 block text-xs text-gray-400">
                            Make
                          </label>
                          <input
                            id="vehicle_make"
                            {...register('inputs.vehicle.make')}
                            placeholder="Vehicle make"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="vehicle_model" className="mb-1 block text-xs text-gray-400">
                            Model
                          </label>
                          <input
                            id="vehicle_model"
                            {...register('inputs.vehicle.model')}
                            placeholder="Vehicle model"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="vehicle_color" className="mb-1 block text-xs text-gray-400">
                            Color
                          </label>
                          <input
                            id="vehicle_color"
                            {...register('inputs.vehicle.color')}
                            placeholder="Vehicle color"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="vehicle_year" className="mb-1 block text-xs text-gray-400">
                            Year
                          </label>
                          <input
                            id="vehicle_year"
                            {...register('inputs.vehicle.year')}
                            placeholder="Vehicle year"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Social Media fields */}
                  {activeFields.includes('social_media') && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Globe className="h-4 w-4" />
                          <span>Social Media Aliases</span>
                        </p>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={addSocialMedia}
                        >
                          <PlusCircle className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      
                      <Controller
                        control={control}
                        name="inputs.social_media"
                        render={({ field }) => (
                          <div className="space-y-3">
                            {(field.value || []).map((_, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <input
                                    {...register(`inputs.social_media.${index}.platform` as const)}
                                    placeholder="Platform (Twitter, Facebook, etc.)"
                                    className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    {...register(`inputs.social_media.${index}.username` as const)}
                                    placeholder="Username or profile ID"
                                    className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                                  />
                                </div>
                                {field.value && field.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSocialMedia(index)}
                                  >
                                    <MinusCircle className="h-4 w-4 text-error-500" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  )}
                  
                  {/* Relatives fields */}
                  {activeFields.includes('relatives') && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Users className="h-4 w-4" />
                          <span>Known Relatives or Associates</span>
                        </p>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={addRelative}
                        >
                          <PlusCircle className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      
                      <Controller
                        control={control}
                        name="inputs.relatives"
                        render={({ field }) => (
                          <div className="space-y-3">
                            {(field.value || []).map((_, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <input
                                    {...register(`inputs.relatives.${index}.name` as const)}
                                    placeholder="Name"
                                    className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    {...register(`inputs.relatives.${index}.relation` as const)}
                                    placeholder="Relationship"
                                    className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                                  />
                                </div>
                                {field.value && field.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRelative(index)}
                                  >
                                    <MinusCircle className="h-4 w-4 text-error-500" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  )}
                  
                  {/* Image upload field */}
                  {activeFields.includes('image') && (
                    <div>
                      <label htmlFor="image" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Image className="h-4 w-4" />
                        <span>Upload Image</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <Controller
                          control={control}
                          name="inputs.image"
                          render={({ field }) => (
                            <div className="flex-1">
                              <input
                                id="image"
                                type="file"
                                accept="image/jpeg, image/png"
                                onChange={(e) => {
                                  field.onChange(e.target.files ? e.target.files[0] : null);
                                }}
                                className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 file:mr-3 file:rounded file:border-0 file:bg-primary-700 file:px-3 file:py-1.5 file:text-white hover:file:bg-primary-600"
                              />
                              <p className="mt-1 text-xs text-gray-400">
                                JPEG, PNG formats for facial analysis (max 5MB)
                              </p>
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Physical description fields */}
                  {activeFields.includes('physical') && (
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>Physical Description</span>
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="height" className="mb-1 block text-xs text-gray-400">
                            Height
                          </label>
                          <input
                            id="height"
                            {...register('inputs.physical.height')}
                            placeholder={'Height (e.g., 6\'2")'}
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="weight" className="mb-1 block text-xs text-gray-400">
                            Weight
                          </label>
                          <input
                            id="weight"
                            {...register('inputs.physical.weight')}
                            placeholder="Weight (e.g., 180 lbs)"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="hair_color" className="mb-1 block text-xs text-gray-400">
                            Hair Color
                          </label>
                          <input
                            id="hair_color"
                            {...register('inputs.physical.hair_color')}
                            placeholder="Hair color"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label htmlFor="eye_color" className="mb-1 block text-xs text-gray-400">
                            Eye Color
                          </label>
                          <input
                            id="eye_color"
                            {...register('inputs.physical.eye_color')}
                            placeholder="Eye color"
                            className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
        
        <CardFooter>
          <div className="flex w-full items-center justify-between">
            <p className="text-xs text-gray-400">
              All data is encrypted and access is logged
            </p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Start Investigation
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
};

interface FieldToggleProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const FieldToggle = ({ icon, label, active, onClick }: FieldToggleProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
      ${active 
        ? 'bg-primary-900/50 text-primary-400 ring-1 ring-primary-700' 
        : 'bg-background text-gray-400 hover:bg-background-lighter hover:text-gray-300'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default InputForm;