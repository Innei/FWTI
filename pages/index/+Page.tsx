import { navigate } from 'vike/client/router'
import { HomePage, setAnswers } from '../../src/App'

export default function Page() {
  return (
    <HomePage
      onStart={() => {
        setAnswers({})
        void navigate('/quiz')
      }}
    />
  )
}
