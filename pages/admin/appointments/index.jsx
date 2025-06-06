import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaCircleInfo, FaRotateRight } from 'react-icons/fa6'
import axios from 'axios'
import toast from 'react-hot-toast'

import Button from '@/components/Button'

const Appointments = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('asc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.post('/appointments/filter', {
        page,
        limit,
        medium: filter !== 'all' ? filter.toUpperCase() : undefined,
        sort,
      })

      setTotal(data.total)
      setData(data.data)
    } catch (error) {
      toast.error(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          'Something went wrong. Please refresh the page!'
      )
    }
  }

  useEffect(() => {
    const storedFilter = sessionStorage.getItem('appointmentFilter')
    const storedSort = sessionStorage.getItem('appointmentSort')
    if (storedFilter) setFilter(storedFilter)
    if (storedSort) setSort(storedSort)
    setPage(Number(searchParams.get('page')) || 1)
  }, [searchParams])

  useEffect(() => {
    if (axios.defaults.headers.common['Authorization']) {
      fetchAppointments()
    }
    sessionStorage.setItem('appointmentFilter', filter)
    sessionStorage.setItem('appointmentSort', sort)
  }, [filter, sort, page, axios.defaults.headers.common['Authorization']])

  const handlePageChange = (newPage) => {
    router.push('/admin/appointments/?page=' + newPage)
  }

  const showingFrom = (page - 1) * limit + 1
  const showingTo = Math.min(page * limit, total)

  console.log('Appointments:', data);

const calculateEndTime = (startTime, duration) => {
  // Convert 12-hour format to minutes
  const timeToMinutes = (time) => {
    let [timePart, period] = time.split(' ')
    let [hours, minutes] = timePart.split(':').map(Number)

    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  // Convert minutes to 12-hour format with AM/PM
  const formatTime = (minutes) => {
    let hours = Math.floor(minutes / 60) % 24
    let mins = minutes % 60
    let period = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12 || 12 // Convert 0 to 12 for 12-hour format
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(
      2,
      '0'
    )} ${period}`
  }

  let startMinutes = timeToMinutes(startTime)
  let endMinutes = startMinutes + Number(duration)

  return formatTime(endMinutes)
}
  

  return (
    <div>
      <div className='h-[104px]'></div>

      {/* Fixed header */}
      <div className='bg-primary text-white px-8 md:px-20 py-8 flex justify-between items-center fixed top-[155px] md:top-0 w-full md:w-[calc(100%-288px)] z-10 right-0'>
        <h1 className='text-2xl font-medium'>Appointment Management</h1>
        <div className='flex items-center gap-4'>
          <Button
            className='bg-white !text-primary rounded-lg flex items-center flex-row gap-2'
            onClick={() => router.refresh()}
          >
            <FaRotateRight />
            Refresh
          </Button>
          <select
            className='mr-4 p-2 rounded-lg text-primary'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value='all'>No Filter</option>
            <option value='online'>Online</option>
            <option value='offline'>Offline</option>
          </select>
          <select
            className='mr-4 p-2 rounded-lg text-primary'
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value='asc'>Ascending</option>
            <option value='desc'>Descending</option>
          </select>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='min-w-full table-auto text-gray-700'>
          <thead>
            <tr>
              <th className='px-4 py-5 font-medium whitespace-nowrap'>No</th>
              <th className='px-4 py-5 font-medium whitespace-nowrap'>
                Patient Name
              </th>
              
              <th className='px-4 py-5 font-medium whitespace-nowrap'>Email</th>
              <th className='px-4 py-5 font-medium whitespace-nowrap'>
                Schedule
              </th>
              <th className='px-4 py-5 font-medium whitespace-nowrap'>
                Slot
              </th>
              <th className='px-4 py-5 font-medium whitespace-nowrap'>
                Therapist
              </th>
              
              <th className='px-4 py-5 font-medium whitespace-nowrap'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((order, index) => (
              <tr key={index} className='border'>
                <td className='px-3 py-4 text-center whitespace-nowrap'>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className='px-3 py-4 whitespace-nowrap text-center'>
                  {order.fullname}
                </td>
                
                <td className='px-3 py-4 text-center whitespace-nowrap'>
                  {order.email}
                </td>
                <td className='px-3 py-4 text-center whitespace-nowrap'>
                  {new Date(order.date).toLocaleDateString()}
                </td>
                <td className='px-3 py-4 text-center whitespace-nowrap'>
                  {order?.Slots
                      ? `${order?.Slots?.startTime} - ${calculateEndTime(
                          order?.Slots?.startTime,
                          order?.Slots?.duration
                        )}`
                      : '-'}
                </td>
                 <td className='px-3 py-4 text-center whitespace-nowrap'>
                  {order?.Slots?.teamMember?.name}
                </td>
                <td className='px-3 py-4 text-primary whitespace-nowrap'>
                  <Link href={`/admin/appointments/${order.id}`}>
                    <FaCircleInfo className='mx-auto text-xl' />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex flex-row items-center justify-between mt-7 md:px-4'>
        <p className='text-gray-400'>
          Showing {data.length > 0 ? `${showingFrom} to ${showingTo}` : 0} of{' '}
          {total} results
        </p>
        <div className='flex flex-row items-center gap-2'>
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
            .filter((pageNumber) => pageNumber !== page)
            .map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`w-7 h-7 flex items-center justify-center rounded-full ${
                  pageNumber === page
                    ? 'text-white bg-primary'
                    : 'text-primary border border-primary'
                } cursor-pointer`}
              >
                {pageNumber}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Appointments
