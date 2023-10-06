'use client';;
import CourseListItem from "@/components/Courses/CourseListItem";
import InputControl from "@/components/FormComponents/InputControl";
import MultiSelectControl from "@/components/FormComponents/MultiSelectControl";
import supabase, { CourseDefinition } from "@/config/supabase";
import { departments } from "@/const/departments";
import {
    Autocomplete,
    AutocompleteOption,
    Button,
    Chip,
    Divider,
    Drawer,
    FormControl,
    FormLabel,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemContent,
    ListItemDecorator,
    Radio,
    RadioGroup,
    Sheet,
    Stack,
    Typography,
    radioClasses,
} from "@mui/joy";
import { NextPage } from "next";
import { useEffect, useState, FC, Fragment, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from "react-feather";
import { useForm, Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { useMediaQuery } from 'usehooks-ts';
import {arrayRange} from '@/helpers/array';
import { render } from "react-dom";


const RefineControls: FC<{ control: Control<FormTypes> }> = ({ control }) => {
    return <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'sm', width: 300 }}>
        <Typography
            id="filter-status"
            sx={{
                textTransform: 'uppercase',
                fontSize: 'xs',
                letterSpacing: 'lg',
                fontWeight: 'lg',
                color: 'text.secondary',
            }}
        >
            Refine
        </Typography>
        <div role="group" aria-labelledby="filter-status">
            <List>
                <ListItem variant="plain" sx={{ borderRadius: 'sm' }}>
                    <MultiSelectControl
                        control={control}
                        name="level"
                        options={[
                            { value: 1, label: '1xxx' },
                            { value: 2, label: '2xxx' },
                            { value: 3, label: '3xxx' },
                            { value: 4, label: '4xxx' },
                            { value: 5, label: '5xxx' },
                            { value: 6, label: '6xxx' },
                            { value: 7, label: '7xxx' },
                            { value: 8, label: '8xxx' },
                            { value: 9, label: '9xxx' },
                        ]}
                        label="Level"
                    />
                </ListItem>
                <ListItem variant="plain" sx={{ borderRadius: 'sm' }}>
                    <MultiSelectControl
                        control={control}
                        name="language"
                        options={[
                            { value: '英', label: 'English' },
                            { value: '中', label: '國語' },
                        ]}
                        label="Instruction Language"
                    />
                </ListItem>
                <ListItem variant="plain" sx={{ borderRadius: 'sm' }}>
                    <FormControl>
                        <FormLabel>Departments</FormLabel>
                        <Controller
                            control={control}
                            name="department"
                            render={({ field: { value, onChange } }) => (
                                <Autocomplete
                                    placeholder="Departments"
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
                    </FormControl>
                </ListItem>
                <ListItem variant="plain" sx={{ borderRadius: 'sm' }}>
                    <MultiSelectControl
                        control={control}
                        name="others"
                        options={[
                            { value: 'xclass', label: 'X-Class' },
                        ]}
                        label="Others"
                    />
                </ListItem>
            </List>
        </div>
        <Button
            variant="outlined"
            color="neutral"
            size="sm"
            onClick={() => { }
            }
            sx={{ px: 1.5, mt: 1 }}
        >
            Clear All
        </Button>
    </Sheet>
}

type FormTypes = {
    textSearch: string,
    level: string[],
    language: string[],
    others: string[],
    department: { code: string; name_zh: string; name_en: string; }[]
}

const CoursePage: NextPage = () => {

    const [courses, setCourses] = useState<CourseDefinition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [headIndex, setHeadIndex] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { control, watch, } = useForm<FormTypes>({
        defaultValues: {
            textSearch: '',
            level: [],
            others: [],
            language: [],
            department: []
        }
    })

    const isMobile = useMediaQuery('(max-width: 768px)');

    //codes should be 4 char, so we need to pad it at the end
    const padEnd = (str: string) => str + ' '.repeat(4 - str.length);

    const paginationRange = (current: number, total: number, max: number = 7) => {
        if (total <= max) return arrayRange(1, total);
        let start = Math.max(1, current - Math.floor(max / 2));
        let end = Math.min(total, start + max - 1);
        if (end - start + 1 < max) {
            start = Math.max(1, end - max + 1);
        }
        return arrayRange(start, end);
    }
    
    const currentPage = headIndex / 30 + 1;
    const totalPage = Math.ceil(totalCount / 30);

    const PAGNIATION_MAX = 7;

    const renderPagination = () => {
        const range = paginationRange(currentPage, totalPage, PAGNIATION_MAX);

        return range.map((page, index) => {
            return (
            <Button  
                variant="soft" 
                aria-pressed={currentPage == page}
                sx={(theme) => ({
                [`&[aria-pressed="true"]`]: {
                    ...theme.variants.outlinedActive.neutral,
                    borderColor: theme.vars.palette.neutral.outlinedHoverBorder,
                },
                })}
                onClick={() => searchQueryFunc(watch(), (page - 1) * 30)}
            >
                {page}
            </Button>)
        })
    }

    const searchQuery = (filters: FormTypes, index: number = 0) => {
        scrollRef.current?.scrollTo(0, 0);
        console.log(filters);
        (async () => {
            setLoading(true);
            try {
                let temp = supabase
                    .from('courses')
                    .select('*', { count: 'exact' })
                if (filters.textSearch) 
                    temp = temp
                        .textSearch('name_en', `'${filters.textSearch.split(' ').join("' & '")}'`)
                if (filters.level.length) 
                    temp = temp
                        .or(filters.level.map(level => `and(course.gte.${level}000,course.lte.${level}999)`).join(','))
                if (filters.language.length) 
                    temp = temp
                        .or(filters.language.map(lang => `language.eq.${lang}`).join(','))
                if (filters.department.length) 
                    temp = temp
                        .in('department', filters.department.map(({ code }) => padEnd(code)))
                if (filters.others.includes('xclass')) 
                    temp = temp
                        .textSearch(`備註`,`'X-Class'`)
                let { data: courses, error, count } = await temp.range(index, index + 29)
                // console.log('range', index, index + 29);
                // move scroll to top
                setTotalCount(count ?? 0)
                if (error) console.log(error);
                else {
                    setCourses(courses!);
                    setHeadIndex(index);
                }
            }
            catch (e) {
                console.error(e);
            }
            setLoading(false);
        })()
    }
    const searchQueryFunc = useDebouncedCallback(searchQuery, 1000);

    //filters
    const filters = watch()
    useEffect(() => {
        searchQueryFunc(filters);
    }, [filters.textSearch, filters.level, filters.department, filters.language, filters.others])


    return (
        <div className="grid grid-cols-1 md:grid-cols-[auto_320px] w-full h-full overflow-hidden">
            <div className="flex flex-col w-full h-full overflow-hidden space-y-5 px-2 pt-2">
                <InputControl
                    control={control}
                    name="textSearch"
                    placeholder="Search for your course (Name, Class, Anything)"
                    variant="soft"
                    endDecorator={isMobile ?
                        <Fragment>
                            <Divider orientation="vertical" />
                            <IconButton onClick={() => setOpen(true)}>
                                <Filter className="text-gray-400 p-1" />
                            </IconButton>
                        </Fragment> :
                        <></>
                    }
                />
                <div className="flex flex-col w-full h-full overflow-auto space-y-5 pb-8 scroll-smooth" ref={scrollRef}>
                    <div className="flex flex-row justify-between px-3 py-1 border-b">
                        <h6 className="text-gray-600">Courses</h6>
                        <h6 className="text-gray-600">Found: {totalCount} Courses</h6>
                    </div>
                    {loading && <LinearProgress />}
                    {courses.map((course, index) => (
                        <CourseListItem key={index} course={course} />
                    ))}
                    <Stack
                        direction="row"
                        justifyContent="center"
                    >
                        {currentPage != 1 && <IconButton onClick={() => searchQuery(filters, 0)}>
                            <ChevronsLeft/>
                        </IconButton>}
                        {currentPage != 1 && <IconButton onClick={() => searchQuery(filters, headIndex - 30)}>
                            <ChevronLeft/>
                        </IconButton>}
                        {renderPagination()}
                        {currentPage != totalPage && <IconButton onClick={() => searchQuery(filters, headIndex + 30)}>
                            <ChevronRight/>
                        </IconButton>}
                        {currentPage != totalPage && <IconButton onClick={() => searchQuery(filters, (totalPage - 1) * 30)}>
                            <ChevronsRight/>
                        </IconButton>}
                    </Stack>
                </div>
            </div>
            {!isMobile && <RefineControls control={control} />}
            {isMobile && <Drawer
                size="md"
                variant="plain"
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{
                    content: {
                        sx: {
                            bgcolor: 'transparent',
                            p: { md: 3, sm: 0 },
                            boxShadow: 'none',
                        },
                    },
                }}
            >
                <RefineControls control={control} />
            </Drawer>}
        </div>

    )
}

export default CoursePage;