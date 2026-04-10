import { navigate } from 'vike/client/router'
import { HomePage, setAnswers, setRetreatCount } from '../../src/App'

export default function Page() {
  return (
    <HomePage
      onStart={() => {
        setAnswers({})
        setRetreatCount(0)
        void navigate('/quiz')
      }}
    />
  )
}
