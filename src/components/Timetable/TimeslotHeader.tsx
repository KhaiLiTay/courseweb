import { TimeSlot } from '@/types/timetable';
import {forwardRef} from 'react';

const BlankTimeslotBody = () => {
    return <div className='h-full w-full bg-gray-100 dark:bg-neutral-800 rounded-md'></div>
}

const TimeslotHeader = forwardRef<HTMLTableCellElement, TimeSlot & { firstRow: boolean, showSaturday?: boolean }>(
    ({ start, end, time, firstRow, showSaturday = false }, ref) => {
        return (
            <tr className='h-0.5'>
                <td className='flex flex-col py-1 justify-between'>
                    <span className='text-[10px] text-gray-700 dark:text-gray-400'>{start}</span>
                    <span className='text-xs font-semibold p-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 my-1'>{time}</span>
                    <span className='text-[10px] text-gray-700 dark:text-gray-400'>{end}</span>
                </td>
                <td className='p-0.5 h-[inherit]' ref={firstRow ? ref: null}><BlankTimeslotBody/></td>
                <td className='p-0.5 h-[inherit]'><BlankTimeslotBody/></td>
                <td className='p-0.5 h-[inherit]'><BlankTimeslotBody/></td>
                <td className='p-0.5 h-[inherit]'><BlankTimeslotBody/></td>
                <td className='p-0.5 h-[inherit]'><BlankTimeslotBody/></td>
                {showSaturday && <td className='p-0.5 h-[inherit]'><BlankTimeslotBody/></td>}
            </tr>
        )
    })

export default TimeslotHeader;