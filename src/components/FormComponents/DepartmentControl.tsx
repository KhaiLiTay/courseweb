import { departments } from '@/const/departments';
import { Autocomplete, AutocompleteOption, Chip, ListItemContent, ListItemDecorator, Typography } from '@mui/joy';
import { Controller, Control } from 'react-hook-form';
import useDictionary from '@/dictionaries/useDictionary';
import { RefineControlFormTypes } from '@/app/[lang]/(mods-pages)/courses/page';

const DepartmentControl = ({ control }: { control: Control<RefineControlFormTypes> }) => {
    const dict = useDictionary();
    return <Controller
        control={control}
        name="department"
        render={({ field: { value, onChange } }) => (
            <Autocomplete
                placeholder={dict.course.refine.department}
                value={value}
                onChange={(e, v) => onChange(v)}
                multiple={true}
                getOptionLabel={(option) => `${option.code} ${option.name_zh} ${option.name_en}`}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) =>
                        <Chip
                            variant="soft"
                            {...getTagProps({ index })}
                        >
                            {`${option.code}`}
                        </Chip>
                    )
                }
                renderOption={(props, option) => (
                    <AutocompleteOption {...props}>
                        <ListItemDecorator>
                            <span className="text-sm font-semibold">{option.code}</span>
                        </ListItemDecorator>
                        <ListItemContent sx={{ fontSize: 'sm' }}>
                            <Typography level="body-xs">
                                {option.name_zh} {option.name_en}
                            </Typography>
                        </ListItemContent>
                    </AutocompleteOption>
                )}
                options={departments}
                sx={{ width: 250 }}
            />
        )} />
}

export default DepartmentControl;